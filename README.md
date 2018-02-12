Hoping for some advice about where to put data fetching. I'm using Vue, but I suspect the story is the same for React. When the page loads, I (sometimes) need to make some api calls.

 - Check if the user is logged in
 - Fetch the list of orgs they belong to
 - etc.

The simplest place would be to dispatch actions for those requests would be the `mounted()` hook of each route's root component. This has some issues:

 - Code Repetition: There's a lot of overlap of what data is required for each route.
 - Repeat Requests: If I navigate to another route (without a full page load), I would end up making those requests again.

I could also kick off the requests from the `<App />` root component (above the `<router-view />`), but I don't want them on all places. For example, I have some routes that don't require login, and if I try to validate the login, or fetch a list of org, I end up causing a redirect to `/login` because the user isn't authenticated.

I'd like some declarative way of specifying which data each component relies on, and then the only requests that would be made are those that _have not yet been fetched_.

Here's an article I'm reflecting on when thinking about caching or memoizing the requests:
https://medium.com/@bluepnume/async-javascript-is-much-more-fun-when-you-spend-less-time-thinking-about-control-flow-8580ce9f73fc

I feel like I could put this information with my routes or root components, and set up something to make this happen. But it seems like this must be a problem other folks have faced and solved already. Does anyone have advice on this?

## vuex-hagrid

“You think it - wise - to trust Hagrid with something as important as this?"
"I would trust Hagrid with my life."


```javascript
export default class Hagrid {
  constructor() {
    this.subscribers = {}; // { actionName: [vm._uid] }
  },
  subscribe(uid, actionNames) {
    actionNames.forEach((actionName) => {
      if (this.subscribers[actionName]) {
        if (this.subscribers[actionName].indexOf(uid) > -1) {
          throw new Error(`Uh oh, the component with id ${uid} is already subscribed to action "${actionName}"...`);
        }
        this.subscribers[actionName].push(uid);
      } else {
        this.subscribers[actionName] = [uid];
        this.addWatcher(actionName);
      }
    });
  },
  unsubscribe(uid) {
    Object.keys(this.subscribers).forEach((actionName) => {
      const newSubs = this.subscribers[actionName].filter(u => u !== uid);
      if (!newSubs.length) {
        delete this.subscribers[actionName]
        this.removeWatcher(actionName);
      } else {
        this.subscribers[actionName] = newSubs;
      }
    });
  },
  addWatcher(actionName) {
    if (this.watchers[actionName]) {
      throw new Error(`Uh oh, the action "${actionName}" is already being watched. Something has gone wrong...`);
    }

    const getterName = findGetter(store, actionName);
    const removeWatcher = this.store.watch(
      (_state, getters) => getters[getterName],
      (val) => this.store.dispatch(actionName, val));
    this.watchers[actionName] = removeWatcher;
  },
  removeWatcher(actionName) {
    this.watchers[actionName]();
    delete this.watchers[actionName];
  },
  install(Vue, options) {
    Vue.mixin({
      mounted() {
        if (!this.reliesOn) { // should this be this.$options.reliesOn?
          return;
        }
        hagrid.subscribe(this._uid, this.reliesOn);
      },
      beforeDestroy() {
        if (!this.reliesOn) { // should this be this.$options.reliesOn?
          return;
        }
        hagrid.unsubscribe(this._uid, this.reliesOn);
      },
    });
  },
}
```

## The Problem

Much of the time, it's obvious where an action should be dispatched. For `<submit @click="login" />`, or anything dispatched in response to a user's action, it's easy to say "This component is responsible". For other actions, it's less clear. Consider some data that is needed by several components, and there might be more than one mounted at any moment. There might be none!

A solution might be to dispatch the action in the `mounted` hook of each component using the data, but to make the action smart enough not to re-fetch data that's already present. This is pretty good, but I'm not sold.

Sometimes the data will need to be refreshed in response to other changes in the store. In an app I'm working on right now a user can belong to multiple organizations. There is a `projects/fetch` action that should be refreshed when the selected org changes.

Two solutions present:

1. The action that changes the selected org tells `projects/fetch` about it.
2. Each component that cares about the data in `projects/fetch` must now also listen for changes to the selected org, and dispatch `projects/fetch` when one occurs.

### Solution 1. `orgs/select` dispatches `projects/fetch`

Add `dispatch('projects/fetch, null, { root: true })` to `orgs/select`. The project fetch action must now keep track of the orgId from when it last fetched, and compare it with the current value to decide whether to fetch again. Remember, it can't just fetch every time, because it's used by multiple components.

So now, in addition to the logic for what it means to actually grab the data we've given the action another responsibility. The action must track the value of orgId (and whatever else it needs to use to make a request), so that it can tell "Have I been dispatched because another component mounted on the screen (and so my data is still up-to-date), or because some of my dependencies changed (and so I need to re-fetch)?".

But wait. `orgs/select` will *always* dispatch `projects/fetch`. What if there are no components that care about that data right now? We're fetching without regard for if anyone is listening.

Besides the issue of fetching when no one cares about the results is a problem of organization. Imagining that an action could have several data dependencies like this, we're spreading the knowledge of those dependencies to where the _dependency_ changes, rather than where the action is defined. That seems backwards to me.

### Solution 2.

For each component, we could listen for changes to each of the action's data dependencies. This gets repetitive in a hurry, since it grows with both the number of components that care about the data, as well as the number of dependencies the action has.

## The Solution

We want to move to more declarative code from two sides. On one side, actions should _declare_ what data would cause them to re-render. On the other side, components should _declare_ what actions produce data that they care about. We can manage all the wiring with vue-hagrid.

### In the store

vue-hagrid will look for a `hagridResources` key in each module of your store (and the root). If provided, `hagridResources` should be an object with the names of actions for keys, and getters for values.

```javascript
export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  hagridResources: {
    'fetchProjects': 'projectsPayload',
  },
}
```

The getter represents the data-dependencies of the action. As long as there is a component listening, hagrid will watch the value of the getter and dispatch the action on any change. The value of the getter will be passed as the payload for the action.

### In the component

```javascript
export default {
  name: 'ProjectsList',
  hagridActions: ['fetchProjects', 'checkLogin'],
}
```

In each component, vue-hagrid will check for a key, `hagridActions`. If it is provided, it should be a list of actions that the component cares about. vue-hagrid will not trigger any events or communicate to the component directly -- information will flow from the store like usual.

## vue-hagrid

[![Build Status](https://travis-ci.org/bgschiller/vue-hagrid.svg?branch=master)](https://travis-ci.org/bgschiller/vue-hagrid)

Hagrid is responsible for:

  - keeping track of vuex actions, and the conditions when they might need to be dispatched again.
  - keeping track of components that care about those actions. An action will only be dispatched if there's a component mounted that relies on that action.
  - Dispatching actions when the associated getter changes, as long as there's a view who cares about that endpoint.

> “You think it &mdash; wise &mdash; to trust Hagrid with something as important as this?"
>
> "I would trust Hagrid with my life."

## Quick Start

Install with `npm install --save vue-hagrid`.

Choose which actions need to be managed with Hagrid. These usually are actions that don't "belong" to any particular component, but rather to multiple components. Add a `hagridResources` key to your store, which should be a map from action name to getter name. The getter contains any data that the action wishes to respond to.

```javascript
  ...
  hagridResources: {
    // projectsPayload is a getter containing the data `fetchProjects` needs
    // in order to perform a fetch. It can be empty.
    fetchProjects: 'projectsPayload',
  },
  ...
```

In each component that relies on those actions, add a `hagridActions` key so that Hagrid will know when subscribers are mounted on the page.

```javascript
   ...
   hagridActions: 'fetchProjects', // or ['fetchProjects', 'anotherAction', ...]
   ...
```

Import and 'use' the Hagrid plugin:

```javascript
const Hagrid = require('vue-hagrid');

Vue.use(Hagrid);
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

### Waiting on actions

Sometimes, you may wish to know in the component when an action has completed. You can access the results (promises) of any action hagrid has dispatched via `component.hagridPromise(actionName)`.

```javascript
hagridActions: ['fetchProjects'],
async mounted() {
  await this.hagridPromise('fetchProjects');
  // at this point, you can be confident that projects have been fetched.
  const toSelect = this.$route.query.projectId || this.projects[0].id;
  this.selectProject(this.projects.find(p => p.id === toSelect));
},
```

## For Example

Check out the [/demo](/demo) directory to see how it's used. The app is running at [https://brianschiller.com/vue-hagrid](https://brianschiller.com/vue-hagrid).

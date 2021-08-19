# Creating Items with Redux

## Introduction

In this section, we will be exploring how to implement the CRUD actions using
the Redux pattern. To start, in this lesson and the next, we will revisit our
todo app, building it out from scratch. This will allow us to review React and
Redux concepts and to implement the **create** action.

## Objectives

By the end of this lesson, you will be able to:

- Take user input from our **React** todo application and send the information
  to **Redux**

## Our Goal

We'll build a form using **React** and **Redux** that allows us to create a list
of todos. Our form will be quite simple, consisting of a single input for the
todo and a submit button.

## Create The Form in React

In `App.js` you can see that we are rendering a `CreateTodo` component which is
imported from the `components/todos` folder; the `CreateTodo` component is where
we will build our form. If you boot up the application (run
`npm install && npm start`), you'll see the text that is currently being
rendered in the `CreateTodo` component.

To build our form, let's update the code in the `CreateTodo` component,
replacing the text with a form element:

```jsx
<form>
  <input type="text" placeholder="add todo" />
  <input type="submit" />
</form>
```

You should now see our form being rendered in the browser.

## Plan for Integrating into Redux

Now let's think about how we want to integrate this into **Redux**. Essentially,
upon submitting the form, we would like to dispatch the following action to the
store:

```jsx
{
  type: 'ADD_TODO',
  todo: todo
}
```

So if the user has typed in "buy groceries", our action would look like:

```jsx
{
  type: 'ADD_TODO',
  todo: 'buy groceries'
}
```

But how do we get that text from the form's input? Well, we can use our normal
React trick of updating the _createTodo component's_ state (not to be confused
with the state in the Redux store) whenever someone types something into the
form. Then, when the user clicks on the submit button, we can grab that state
and use it to create our action:

```jsx
{
  type: 'ADD_TODO',
  todo: this.state
}
```

Ok, time to implement it. Step one will be updating the component state whenever
someone types in the form.

### 1. Create a Controlled Form Using State and an `onChange` Event Handler

Every time the input is changed, we want to change the component state. To
review, the process for doing this is:

1. create our initial component state; then
2. add an `onChange` handler to our input that calls a function which will...
3. use `setState` to update the component state whenever the user types
   something in the input field.

Let's start by setting the component's initial state:

```jsx
// ./src/components/todos/createTodo

...

constructor() {
  super();
  this.state = {
    text: '',
  };
}

...
```

Next, we'll modify our render function, adding the event handler to our input element:

```jsx
// ./src/components/todos/createTodo

...
render() {
  return(
    <div>
      <form>
        <input
          type="text"
          placeholder="add todo"
          onChange={(event) => this.handleChange(event)}
        />
        <input type="submit" />
      </form>
    </div>
  )
}

...
```

Finally, let's add our `handleChange` function:

```jsx
// ./src/components/todos/createTodo

...

handleChange(event) {
  this.setState({
    text: event.target.value
  });
};

...
```

Notice that we pass through the event, which comes from the `onChange` event
handler. The event's target is the input that was listening for the event (the
text field), and the value is the current value of that text field.

Currently, we're using class method syntax to define `handleChange()` on our
component. The JSX code within our `render()` method is particular to a specific
instance of the component, but, by default, **class methods are called in the
context of the [prototype chain][], not in the context of an instance**. In
order for `this` to correctly reference _this_ specific instance of our
component, we need to either bind it (often done in the `constructor()`), or use
an arrow function in our `onChange` event handler. Because arrow functions don't
define their own version of `this`, they'll default to the context they are in.

In modern JavaScript, we are able to directly assign class properties instead of
assigning them inside a `constructor()`. This means that, instead of writing
`handleChange()` as a class method, we can declare it as a class property and
assign an arrow function to it:

```jsx
handleChange = (event) => {
  this.setState({
    text: event.target.value,
  });
};
```

The result is that `handleChange()` will always be bound to the particular
instance of the component it is defined in. This means we can actually write an
even shorter `onChange` callback: `onChange={this.handleChange}`. In this case,
`this.handleChange` refers to the definition of a function that takes in the
event as an argument. No need to explicitly pass `event`, which means no need
for the `onChange` arrow function callback anymore!

To make a completely controlled form, we will also need to set the `value`
attribute of our `input` element to `this.state.text`. This way, every key
stroke within the `input` will call `setState` from within `handleChange`, and
the component will re-render and display the new value for `this.state.text`.

With this final change, our **CreateTodo** component should look like this:

```jsx
// ./src/components/todos/CreateTodo.js

import React, { Component } from "react";

class CreateTodo extends Component {
  constructor() {
    super();
    this.state = {
      text: "",
    };
  }

  handleChange = (event) => {
    this.setState({
      text: event.target.value,
    });
  };

  render() {
    return (
      <div>
        <form>
          <p>
            <input
              type="text"
              placeholder="add todo"
              onChange={this.handleChange}
              value={this.state.text}
            />
          </p>
          <input type="submit" />
        </form>
        {this.state.text}
      </div>
    );
  }
}

export default CreateTodo;
```

**Note**: As the user types, the text will show in the input box whether or not
we have successfully controlled our form. To confirm that we are properly
changing the component's state, we've added the line `{this.state.text}` at the
bottom of the div wrapping our form. If we see our DOM change with every
character we type in, we're in good shape.

It's on to step 2.

### 2. On Submission of Form, Dispatch an Action to the Store

Okay, so now we need to make changes to our form so that when the user clicks
submit, we dispatch an action to the store. Notice that a lot of the setup for
Redux is already done for you. Open up the `./src/index.js` file. There you'll
see the following:

```jsx
// ./src/index.js

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import manageTodo from "./reducers/manageTodo";
import { Provider } from "react-redux";
import { createStore } from "redux";

let store = createStore(manageTodo);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
```

Just below the `import` statements, you can see that we create the store using
`createStore`, provided by `redux`. Then, further down, we pass the store into
the `Provider`. This will allow us access to the store when we _connect_ our c
components.

Next we'll connect the `CreateTodo` component. First, we want to import
`connect` from `react-redux` and modify our export statement:

```js
// ./src/components/todos/CreateTodo.js
import { connect } from 'react-redux';

...

export default connect(null, mapDispatchToProps)(CreateTodo);
```

Note that we are passing `null` as the first argument to connect. This is
because, for this component, we are not concerned with writing a
`mapStateToProps()` function. In the next lesson, we will create components to
render the todos and create a `mapStateToProps` function to access the todos in
the store but, for now, the only thing we need from the store is the `dispatch`
method. Since `mapDispatchToProps` must be passed as the _second_ argument in
order to have access to the `dispatch` method, we need to pass `null` as the
first argument.

Next, as we write out our `mapDispatchToProps()` function, we'll need to decide
how to structure our data and the related action. The basic frame of the
function will look like the following:

```jsx
// ./src/components/todos/CreateTodo.js

const mapDispatchToProps = (dispatch) => {
  return {
    addTodo: () => dispatch(someAction),
  };
};
```

From the Redux docs, we know that `someAction` needs to be a plain JavaScript
object with a `type` key describing the type of action. We also need to include
the data from the form - we'll call that key 'payload'.

```jsx
const mapDispatchToProps = (dispatch) => {
  return {
    addTodo: () => dispatch({ type: "ADD_TODO", payload: formData }),
  };
};
```

Then, in order to make the form data available to our `addTodo` function, we'll
pass it as an argument and access that value in our action object:

```jsx
const mapDispatchToProps = (dispatch) => {
  return {
    addTodo: (formData) => dispatch({ type: "ADD_TODO", payload: formData }),
  };
};
```

Now we need to update the **render()** function of the **CreateTodo** component
to call `addTodo` when the form is submitted. First we'll add the event handler
to our form element:

```jsx
// ./src/components/todos/CreateTodo.js

...

<form onSubmit={this.handleSubmit}>

...
```

Then we'll add the **handleSubmit()** function:

```jsx
// ./src/components/todos/CreateTodo.js

...

handleSubmit = event => {
  event.preventDefault();
  this.props.addTodo(this.state)
}

...
```

When `handleSubmit()` is called, it in turn calls the `addTodo` function,
passing in the form data stored in `this.state` as an argument. The `addTodo`
function then creates the action and dispatches it to our reducer. The fully
redux'd component ends up looking like the following:

```jsx
import React, { Component } from "react";
import { connect } from "react-redux";

class CreateTodo extends Component {
  state = {
    text: "",
  };

  handleChange = (event) => {
    this.setState({
      text: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.addTodo(this.state);
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <p>
            <input
              type="text"
              placeholder="add todo"
              onChange={this.handleChange}
              value={this.state.text}
            />
          </p>
          <input type="submit" />
        </form>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTodo: (formData) => dispatch({ type: "ADD_TODO", payload: formData }),
  };
};

export default connect(null, mapDispatchToProps)(CreateTodo);
```

Now, if you start up the app and submit a todo, `this.state` will be dispatched
to the reducer with the action. You should see your actions logged via a
`console.log` in our reducer.

#### Alternate approach

Remember that, if not given any arguments, `connect` will automatically return
`dispatch` as a prop to the component we're wrapping with `connect`. Therefore,
rather than creating a `mapDispatchToProps` function, we could instead call
`dispatch` directly from our `handleSubmit` function, explicitly passing in our
action:

```jsx
...

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.dispatch({ type: "ADD_TODO", payload: this.state });
  };

...
```

We would then also need to change our export as follows:

```jsx
export default connect()(CreateTodo);
```

### 3. Update State

Now we are properly dispatching the action, but we haven't yet written the code
in the reducer to update the state. So let's do that.

Open up the file `./src/reducers/manageTodo.js` and you will see that the
initial state is already set to an empty list of todos. Next, we need to update
our reducer so it will add a new todo each time we receive an action. For
example, if it receives an action that looks like
`{ type: 'ADD_TODO', payload: { text: 'watch baseball' } }`, our state should be
updated to look like:

```jsx
state = {
  todos: ["watch baseball"],
};
```

To do that, we will add a switch statement to our reducer that switches on our
action type, and add a case for our `ADD_TODO` action. There we will use the
spread operator to create a new list of todos in our state with the added todo
at the end:

```jsx
// ./src/reducers/manageTodo.js

export default function manageTodo(
  state = {
    todos: [],
  },
  action
) {
  switch (action.type) {
    case "ADD_TODO":
      console.log({ todos: [...state.todos, action.payload.text] });

      return { todos: [...state.todos, action.payload.text] };

    default:
      return state;
  }
}
```

With these changes, open up the console in your browser, and try adding a few
todos. The log will show that our reducer is adding new values every time
the form is submitted!

In the next lesson we will tackle rendering our list of todos to the DOM.

## Summary

There's a lot of typing in this section, but three main steps.

- First, we made sure the React component of our application was working. We did
  this by building a form, and then making sure that whenever the user typed
  something into the form's input, the component's state was updated.

- Second, we connected the component to **Redux** and created our
  `mapDispatchToProps` to dispatch our `ADD_TODO` action to the reducer

- Third, we built our reducer such that it responded to the appropriate event
  and concatenated the payload into our array of todos.

[prototype chain]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

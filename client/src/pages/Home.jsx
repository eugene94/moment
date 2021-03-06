import React, { Component } from 'react';

import { NewContainer } from '../components/new';
import { TodoContainer } from '../components/todo';

import ApiCommon from '../lib/ApiCommon';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 1rem;
  margin-top: 1rem;
`;

class Home extends Component {
  state = {
    newTodo: {
      title: '',
      content: '',
      error: false
    },
    todos: [{}],
    priorities: [{ color: '', id: -1, label: '' }],
    order: 'createdAt'
  };

  componentDidMount() {
    Promise.all([ApiCommon.get('/api/todos'), ApiCommon.get('/api/priorities')]).then(results => {
      const todoData = results.shift().data;
      const priorityData = results.shift().data;

      if (todoData.error) {
        alert(todoData.errorMessage);
        return;
      }
      if (priorityData.error) {
        alert(priorityData.errorMessage);
        return;
      }

      this.setState({
        ...this.state,
        todos: todoData.todos,
        priorities: priorityData.priorities
      });
    });
  }

  handleChange = e => {
    const { newTodo } = this.state;
    const nextState = {
      ...this.state,
      newTodo: {
        ...newTodo,
        [e.target.name]: e.target.value,
        error: false
      }
    };

    this.setState(nextState);
  };

  isEmpty(text) {
    return text === '' ? true : false;
  }

  handleCreate = () => {
    const { newTodo, todos } = this.state;

    if (this.isEmpty(newTodo.title)) {
      this.setState({
        ...this.state,
        newTodo: { ...newTodo, error: true }
      });
      return;
    }

    ApiCommon.post('/api/todo', newTodo).then(res => {
      const { todo, error, errorMessage } = res.data;

      if (error) {
        alert(errorMessage);
        return;
      }

      this.setState({
        ...this.todos,
        newTodo: {
          title: '',
          content: '',
          error: false
        },
        todos: todos.concat(todo)
      });
    });
  };

  handleRemove = id => {
    const { todos } = this.state;

    ApiCommon.remove('/api/todo/', id).then(res => {
      const { error, errorMessage } = res.data;

      if (error) {
        alert(errorMessage);
        return;
      }

      this.setState({
        ...this.state,
        todos: todos.filter(todo => todo.id !== id)
      });
    });
  };

  handleToggle = id => {
    const { todos } = this.state;

    const index = todos.findIndex(todo => todo.id === id);

    const nextTodos = [...todos];
    const updateData = { checked: !todos[index].checked };

    ApiCommon.patch('/api/todo/', id, updateData).then(res => {
      const { todo } = res.data;

      nextTodos[index].checked = todo.checked;

      this.setState({
        ...this.state,
        todos: nextTodos
      });
    });
  };

  handleOrder = e => {
    const orderFlag = e.target.value;

    ApiCommon.get(`/api/todos/${orderFlag}`).then(res => {
      const { todos } = res.data;
      this.setState({
        ...this.state,
        todos,
        order: orderFlag
      });
    });
  };

  render() {
    const { newTodo, todos, priorities, order } = this.state;
    return (
      <>
        <NewContainer {...newTodo} onChange={this.handleChange} onCreate={this.handleCreate} />
        <Wrapper>
          <TodoContainer
            todos={todos}
            priorities={priorities}
            order={order}
            onOrderClick={this.handleOrder}
            handleToggle={this.handleToggle}
            handleRemove={this.handleRemove}
          />
        </Wrapper>
      </>
    );
  }
}

export default Home;

import React, { Component } from 'react';
import {connect} from 'react-redux'

class CreateTodo extends Component {
  // constructor(){
  //   super()
  //   this.state = {
  //     text: ''
  //   }
  // }
  // !class method syntax 
  // handleChange(event){
  //   this.setState({text:event.target.value})
  // }
  state ={
    text: ''
  }
  handleChange = (event) => {
    this.setState({text: event.target.value})
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.addTodo(this.state)
  }

  render() {
    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            onChange={this.handleChange}
            type="text"
            placeholder='add todo'
            value={this.state.text}/>
          <input type="submit" />
        </form>
        {this.state.text}
      </div>
    )
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    addTodo: (formData)=> dispatch({type: 'ADD_TODO', payload: formData})
  }
}


export default connect(null, mapDispatchToProps)(CreateTodo);

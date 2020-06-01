import React, { Component, Children } from 'react';
// import logo from './logo.svg';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
    },
    {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
    },
];

function isSerched(searchValue){
  return function(item){
    return item.title.toLowerCase().includes(searchValue.toLowerCase());
  }
}

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      list: list,
      searchValue: '',
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.searchFilter = this.searchFilter.bind(this);
  }
  onDismiss(id) {
    const updatedList = this.state.list.filter(item => item.objectID !== id);
    this.setState({ list: updatedList });
  }
  searchFilter(event){
    this.setState({searchValue: event.target.value} );
  }
  render(){
    const {list, searchValue} = this.state;
    return (
      <div className="App">
        <Search onChange={this.searchFilter} value={searchValue}>Search </Search>
        <Table list={list} pattern={searchValue} onDismiss={this.onDismiss} />
      </div>
    );
  }
}

const Search = ({value, onChange, children}) => {
  return(
    <form>
      {children}
      <input type='text' value={value} onChange={onChange} /> 
    </form>
  );
}

const Table = ( {list, pattern, onDismiss})=>{
    return (
        <div>
          {
            list.filter(isSerched(pattern)).map(item=>
                <div key={item.objectID}>
                  <span><a href={item.url}>{item.title} </a></span> 
                  <span>{item.author} </span> 
                  <span>{item.num_comments} </span> 
                  <span>{item.points} </span> 
                  <span>
                    <Button onClick={()=>onDismiss(item.objectID)} >Dismiss</Button>
                  </span>
                </div>
            )
          }
        </div>
    );
  
}
const Button = ({onClick, className='', children})=> {

    return (
      <button onClick={onClick} className={className} type="button" >
        {children}
      </button>
    );
  
}

export default App;

import React, { Component } from 'react';
import axios from 'axios';
// import logo from './logo.svg';
import './App.css';
import PropTypes from 'prop-types';

const DEFAULT_QUERY = 'hackernews';
const DEFAULT_HPP = '10';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

// const list = [
//   {
//     title: 'React',
//     url: 'https://facebook.github.io/react/',
//     author: 'Jordan Walke',
//     num_comments: 3,
//     points: 4,
//     objectID: 0,
//     },
//     {
//     title: 'Redux',
//     url: 'https://github.com/reactjs/redux',
//     author: 'Dan Abramov, Andrew Clark',
//     num_comments: 2,
//     points: 5,
//     objectID: 1,
//     },
// ];

// function isSerched(searchTerm){
//   return function(item){
//     return item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// }

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      // list: list,
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.searchFilter = this.searchFilter.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }

  searchSubmit(e){
    const {searchTerm} = this.state;
    this.setState({ searchKey: searchTerm });
    // this.fetchSearchTopStories(searchTerm);
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    e.preventDefault();
  }
  
  fetchSearchTopStories(searchTerm, page=0){
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      // .then(response => response.json())
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({ error }));
  }
  setSearchTopStories(result)
  {
    const { hits, page } = result;
    const {searchKey , results} = this.state;
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits ];
    this.setState(
      {
        results:{
          ...results,
          [searchKey]: { hits: updatedHits, page }
        }
      }
    );
  }

  componentDidMount(){
      const{searchTerm} = this.state;  
      this.setState({ searchKey: searchTerm });
      this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    // const updatedList = this.state.result.hits.filter(item => item.objectID !== id);
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    // const updatedResult = Object.assign({}, this.state.result, updatedHits)
    this.setState(
      { 
        results: {...results, [searchKey]: { hits: updatedHits, page}} ,
      }
    );
  }

  searchFilter(event){
    this.setState({searchTerm: event.target.value} );
  }

  render(){
    const { searchTerm, results, searchKey, error } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    // console.log(list)
    // if (!results) 
    // { 
    //   return null; 
    // }
    if (error) {
      return <p>Something went wrong.</p>;
    } 
    return (
      <div className="App">
        <Search onChange={this.searchFilter} onSubmit={this.searchSubmit} value={searchTerm}>Search </Search>
        {
          //result ?
          error ? 
            <div className="interactions">
              <p>Something went wrong.</p>
            </div> :
          results && 
            <Table list={list} /* pattern={searchTerm} */ onDismiss={this.onDismiss} />
          //: null 
          }
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1 )}>
          More
          </Button>
      </div>
    );
  }
}

const Search = ({
                  value,
                  onChange,
                  onSubmit,
                  children
                })  => 
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">
      {children}
    </button>
  </form>
  Search.PropTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

const Table = ({
                  list, 
                  /*pattern, */
                  onDismiss
              })=>
  <div>
    {
      list/* .filter(isSerched(pattern))*/.map(item=>
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
    <hr></hr>
  </div>
  Table.PropTypes = {
    list: PropTypes.arrayOf(
      PropTypes.shape({
        objectID: PropTypes.string.isRequired,
        author: PropTypes.string,
        url: PropTypes.string,
        num_comments: PropTypes.number,
        points: PropTypes.number,
      })
    ).isRequired, 
    onDismiss: PropTypes.func.isRequired,
  }
  
  
const Button = ({onClick, className, children})=> 
  <button onClick={onClick} className={className} type="button" >
    {children}
  </button>
  Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
  };
  
export {Search, Button, Table};
export default App;

import React, { Component } from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import classNames from 'classnames';
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

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading
    ? <Loading />
    : <Component { ...rest } />

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      // list: list,
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.searchFilter = this.searchFilter.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey){
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({sortKey, isSortReverse});
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
    this.setState({ isLoading: true });

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
        },
        isLoading: false,
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
    const { 
      searchTerm, 
      results, 
      searchKey, 
      error,
      isLoading,
      sortKey,
      isSortReverse,
    } = this.state;
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
        <Search 
          onChange={this.searchFilter} 
          onSubmit={this.searchSubmit} 
          value={searchTerm}
        >
            Search 
          </Search>
        {
          //result ?
          error ? 
            <div className="interactions">
              <p>Something went wrong.</p>
            </div> :
          results && 
            <Table 
              list={list} 
              /* pattern={searchTerm} */ 
              onDismiss={this.onDismiss} 
              sortKey={sortKey}
              onSort={this.onSort}
              isSortReverse={isSortReverse}
            />
          //: null 
          }
          { isLoading
            ? <Loading />
            : <ButtonWithLoading 
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1 )}>
              More
            </ButtonWithLoading>
          }
      </div>
    );
  }
}

class Search extends Component{
  
  componentDidMount(){
    if(this.input){
      this.input.focus();
    }
  }
  
  render(){
    const {
      value,
      onChange,
      onSubmit,
      children
    } = this.props;
    
    // Search.PropTypes = {
    //   value: PropTypes.string.isRequired,
    //   onChange: PropTypes.func.isRequired,
    //   onSubmit: PropTypes.func.isRequired,
    //   children: PropTypes.node.isRequired,
    // };

    return(
    <form onSubmit={onSubmit}>
      <input type="text" 
        value={value} 
        onChange={onChange} 
        ref={(node)=>{ this.input = node; }} 
        />
      <button type="submit">
        {children}
      </button>
    </form>
    ); 
  }   
} 

const Table = ({
                  list, 
                  /*pattern, */
                  sortKey,
                  isSortReverse,
                  onSort,
                  onDismiss,
              })=>
              {
                const sortedList = SORTS[sortKey](list);
                const reverseSortedList = isSortReverse
                ? sortedList.reverse()
                : sortedList;
                return(
                  <div className="table">
                    <div className="table-header">
                      <span style={{ width: '40%' }}>
                        <Sort
                          sortKey={'TITLE'}
                          onSort={onSort}
                          activeSortKey={sortKey}
                        >
                          Title
                        </Sort>
                      </span>
                      <span style={{ width: '30%' }}>
                        <Sort
                          sortKey={'AUTHOR'}
                          onSort={onSort}
                          activeSortKey={sortKey}
                        >
                          Author
                        </Sort>
                      </span>
                      <span style={{ width: '10%' }}>
                        <Sort
                          sortKey={'COMMENTS'}
                          onSort={onSort}
                          activeSortKey={sortKey}
                        >
                          Comments
                        </Sort>
                      </span>
                      <span style={{ width: '10%' }}>
                        <Sort
                          sortKey={'POINTS'}
                          onSort={onSort}
                          activeSortKey={sortKey}
                        >
                          Points
                        </Sort>
                      </span>
                      <span style={{ width: '10%' }}>
                        Archive
                      </span>
                    </div>
                    {
                      reverseSortedList/* .filter(isSerched(pattern))*/.map(item=>
                          <div key={item.objectID} className="table-row">
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

                );
              }
                
  // Table.PropTypes = {
  //   list: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       objectID: PropTypes.string.isRequired,
  //       author: PropTypes.string,
  //       url: PropTypes.string,
  //       num_comments: PropTypes.number,
  //       points: PropTypes.number,
  //     })
  //   ).isRequired, 
  //   onDismiss: PropTypes.func.isRequired,
  // }
  
  
const Button = ({onClick, className, children})=> 
  <button onClick={onClick} className={className} type="button" >
    {children}
  </button>
  Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
  };
  
  const Loading = () =>
    <div>Loading ...</div>

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, activeSortKey,onSort, children }) =>
  {
    const sortClass = classNames(
      'button-inline',
      { 'button-active': sortKey === activeSortKey }
    );
    return(
      <Button 
        onClick={() => onSort(sortKey)} 
        className={sortClass}
      >
        {children}
      </Button>
    );
  }
export {Search, Button, Table};
export default App;

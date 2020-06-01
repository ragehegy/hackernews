import React, { Component, Children } from 'react';
// import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'hackernews';
const DEFAULT_HPP = '10';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

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

// function isSerched(searchValue){
//   return function(item){
//     return item.title.toLowerCase().includes(searchValue.toLowerCase());
//   }
// }

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      // list: list,
      result: null,
      searchValue: DEFAULT_QUERY,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.searchFilter = this.searchFilter.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
  }

  searchSubmit(e){
    const {searchValue} = this.state;
    this.fetchSearchTopStories(searchValue);
    e.preventDefault();
  }
  
  fetchSearchTopStories(searchValue, page=0){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchValue}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }
  setSearchTopStories(result)
  {
    const { hits, page } = result;
    const oldHits = page !== 0 ? this.state.result.hits : [];
    const updatedHits = [...oldHits, ...hits ];
    this.setState(
      {
        result: { hits: updatedHits, page }
      }
    );
  }

  componentDidMount(){
      const{searchValue} = this.state;  
      this.fetchSearchTopStories(searchValue);
  }

  onDismiss(id) {
    // const updatedList = this.state.result.hits.filter(item => item.objectID !== id);
    const updatedHits = this.state.result.hits.filter(item => item.objectID !== id);
    // const updatedResult = Object.assign({}, this.state.result, updatedHits)
    this.setState(
      { 
        result: {...this.state.result, hits: updatedHits} ,
      }
    );
  }

  searchFilter(event){
    this.setState({searchValue: event.target.value} );
  }

  render(){
    const { searchValue, result } = this.state;
    const page = (result && result.page) || 0;
    console.log(list)
    if (!result) 
    { 
      return null; 
    }
    return (
      <div className="App">
        <Search onChange={this.searchFilter} onSubmit={this.searchSubmit} value={searchValue}>Search </Search>
        {
          //result ?
          result && 
            <Table list={result.hits} /* pattern={searchValue} */ onDismiss={this.onDismiss} />
          //: null 
          }
          <Button onClick={() => this.fetchSearchTopStories(searchValue, page + 1 )}>
          More
          </Button>
      </div>
    );
  }
}

const Search = (
  {
  value,
  onChange,
  onSubmit,
  children
}
) =>
  <form onSubmit={onSubmit}>
  <input
  type="text"
  value={value}
  onChange={onChange}
  />
  <button type="submit">
  {children}
  </button>
  </form>

const Table = ( {list, /*pattern, */onDismiss})=>{
    return (
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

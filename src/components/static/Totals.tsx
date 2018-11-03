import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid,Label, Table, Dropdown, Icon, Search, List, Input, Button, Container, Divider, Message} from 'semantic-ui-react'
var fetch = require('node-fetch');
var dateFormat = require('dateformat');
const querystring = require('querystring');
import Times from '../Times'

class Result {
    name: string
    total: number
    isCheckedIn: boolean
    issue: boolean
}

const sortPeople = (a,b) => { 
    if (a.issue && b.issue == false) {
        return -1;
    } else if (a.issue == false && b.issue) {
        return 1;
    }
    if (a.isCheckedIn && b.isCheckedIn == false) {
        return -1;
    } else if (a.isCheckedIn == false && b.isCheckedIn) {
        return 1;
    } 
    return b.total - a.total 
}

export default class Totals extends React.Component<{}, {
    results: Array<Result>
    loading: boolean
    selectedPerson: string
    displayPerson: boolean
    times: Array<{
        startTime: number
        endTime: number
    }>
    loadingTimes: boolean
    search?: string,
    currentCategory?: string
    categories: Array<{
        category: string,
        current: boolean
    }>
}> {
    constructor(props) {
        super(props)
        this.state = {
            results: [],
            loading: false,
            selectedPerson: "",
            displayPerson: false,
            loadingTimes: false,
            times:[],
            search: null,
            currentCategory: null ,
            categories: []
        }
    }
    componentDidMount() {
        this.loadCategories();
        this.loadCurrentCategory();
    }
    loadCurrentCategory() {
        fetch('/api/currentCategory').then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                currentCategory: results.category
            }, () => {
                this.loadResults();
            })
        })
    }
    loadCategories() {
        fetch('/api/categories').then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                categories: results
            })
        })
    }
    
    loadResults() {
        fetch('/api/totals?'+querystring.stringify({
            category: this.state.currentCategory
        })).then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                results,
                loading: false
            })
        })
    }

    loadTimes(name) {
        this.setState({
            selectedPerson: name,
            displayPerson: true
        });
    }
    
    render() {
        var categoryOptions = this.state.categories.map((category, index) => {
            return {
                key: index,
                text: category.category,
                value: category.category
            }
        })
        categoryOptions.unshift({
            key: categoryOptions.length,
            text: 'All',
            value: '*'
        })
        return (
            <div>
                <Header textAlign="center">{this.state.displayPerson ? this.state.selectedPerson : `Total Hours`}</Header>
               
                {this.state.displayPerson ? null : <div> <Button content='Refresh' loading={this.state.loading} onClick={() => {
                    this.loadResults()
                }}/> <Button content='Export' as={'a'} {...{'href':'/api/totals?'+querystring.stringify({
                    exportType: 'csv',
                    category: this.state.currentCategory
                })}}/> <Dropdown placeholder='Select Category' value={this.state.currentCategory} onChange={(e, data) => {
                    this.setState({
                        currentCategory: data.value.toString()
                    }, () => {
                        this.loadResults();
                    })
                }} options={categoryOptions} /> <div style={{width: 200, float:'right'}}> <Search fluid open={false}
                loading={this.state.loading}
                onSearchChange={(e, props) => {
                    if (props.value.length == 0) {
                        this.setState({
                            search: null
                        })
                    } else {
                        this.setState({
                            search: props.value
                        })
                    }
                }}
                value={this.state.search}
            /> </div>
                <Table celled selectable>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name <Label size="tiny"><Icon name="calendar check" />Checked In</Label> <Label size="tiny"> <Icon name="flag" />Potential Issue</Label></Table.HeaderCell>
                        <Table.HeaderCell>Hours</Table.HeaderCell>
                        <Table.HeaderCell>Minutes</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {this.state.results.filter((a) => {
                        if (this.state.search == null) {
                            return true;
                        } else {
                            return (a.name.toLowerCase().indexOf(this.state.search.toLowerCase()) >= 0);
                        }
                    }).sort(sortPeople).map((person: Result) => {
                     var hours = Math.floor(person.total / (60 * 60))
                     var minutes = Math.round((person.total / 60) - (hours * 60))
                    return ( <Table.Row onClick={() => {
                        this.loadTimes(person.name)
                    }}>
                                <Table.Cell>{person.name} {person.isCheckedIn ? <Icon name="calendar check" /> : null } {person.issue ? <Icon name="flag" /> : null }</Table.Cell>
                                <Table.Cell>{hours}</Table.Cell>
                                <Table.Cell>{minutes}</Table.Cell>

                        </Table.Row>)
                 })}
                   
                        </Table.Body>
                        </Table></div>}
                {this.state.displayPerson ? <div style={{marginTop: 15}}>

                

                        <Times selectedPerson={this.state.selectedPerson} onLoad={() => {
                            this.setState({
                                displayPerson: true
                            })
                        }}  onBack={() => {
                            this.loadResults()
                            this.setState({
                                displayPerson: false
                            })
                        }}/>
                </div> : null }
                        
            </div>
        )
    }
}

import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Table, Icon, Search, List, Input, Button, Container, Divider, Message} from 'semantic-ui-react'
var fetch = require('node-fetch');
var dateFormat = require('dateformat');
const querystring = require('querystring');
import Times from '../Times'

class Result {
    name: string
}

export default class Totals extends React.Component<{}, {
    results: Array<Result>
    loading: boolean
    selectedPerson: string
    displayPerson: boolean,
    search?: string
}> {
    constructor(props) {
        super(props)
        this.state = {
            results: [],
            loading: false,
            selectedPerson: "",
            displayPerson: false,
            search: null
        }
    }
    componentDidMount() {
        this.loadResults()
    }
    loadResults() {
        fetch('/api/people').then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                results,
                loading: false
            })
        })
    }

    loadTimes(name) {
        console.log('loadTimes('+name+')')
        this.setState({
            selectedPerson: name,
            displayPerson: true
        });
    }
    
    render() {
        return (
            <div>
                <Header textAlign="center">{this.state.displayPerson ? this.state.selectedPerson : `Volunteers`}</Header>
               
                {this.state.displayPerson ? null : <div> <Button content='Refresh' loading={this.state.loading} onClick={() => {
                    this.loadResults()
                }}/> <div style={{width: 200, float:'right'}}> <Search fluid open={false}
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
            /></div>
                <Table celled selectable>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {this.state.results.filter((a) => {
                        if (this.state.search == null) {
                            return true;
                        } else {
                            return (a.name.toLowerCase().indexOf(this.state.search.toLowerCase()) >= 0);
                        }
                    }).sort().map((person: Result) => {
                    return ( <Table.Row onClick={() => {
                        this.loadTimes(person.name)
                    }}>
                                <Table.Cell>{person.name}</Table.Cell>

                        </Table.Row>)
                 })}
                   
                        </Table.Body>
                        </Table></div>}
                {this.state.displayPerson ? <div style={{marginTop: 15}}>

    <Times selectedPerson={this.state.selectedPerson} onLoad={() => {
                           this.setState({
                               displayPerson: true
                           })
                       }} onBack={() =>{
                        this.setState({
                            displayPerson: false
                        })
                       }}/>

                       
                </div> : null }

               
                        
            </div>
        )
    }
}

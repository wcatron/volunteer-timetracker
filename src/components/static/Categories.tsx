import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Table, Icon, Search, List, Input, Button, Container, Divider, Message} from 'semantic-ui-react'
var fetch = require('node-fetch');
var dateFormat = require('dateformat');
const querystring = require('querystring');
import Times from '../Times'

class Result {
    category: string
    current: boolean
}

export default class Totals extends React.Component<{}, {
    results: Array<Result>
    loading: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            results: [],
            loading: false
        }
    }
    componentDidMount() {
        this.loadResults()
    }
    loadResults() {
        fetch('/api/categories').then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                results,
                loading: false
            })
        })
    }

    setCurrent(category) {
        fetch('/api/currentCategory?'+querystring.stringify({
            category
        }),{
            method: 'put'
        }).then((results) => {
            return results.json();
        }).then((results) => {
            this.loadResults();
        })
    }
    
    render() {
        return (
            <div>
                <Header textAlign="center">Categories</Header>
               
                 <Button content='Refresh' loading={this.state.loading} onClick={() => {
                    this.loadResults()
                }}/> 
                <Table celled selectable>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Current</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {this.state.results.sort().map((item: Result) => {
                    return ( <Table.Row>
                                <Table.Cell>{item.category}</Table.Cell>
                                <Table.Cell>{item.current ? <Button content="Current" size="tiny" disabled /> : <Button content="Set as Current" size="tiny" onClick={() =>{
                                    this.setCurrent(item.category)
                                }} />}</Table.Cell>
                        </Table.Row>)
                 })}
                   
                        </Table.Body>
                        </Table>
               
                        
            </div>
        )
    }
}

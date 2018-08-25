import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Icon, List, Input, Button, Container, Divider, Message, Form} from 'semantic-ui-react'
var fetch = require('node-fetch');
var dateFormat = require('dateformat');
const querystring = require('querystring');

class Person {
    name: string
}

export default class Index extends React.Component<{}, {
    results: Array<Person>,
    loading: boolean,
    name: string,
    found: boolean,
    displayCheckedInMessage: boolean,
    displayCheckedOutMessage: boolean,
    loadingStatus: boolean,
    checkInDate: Date,
    isCheckedIn: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            results: [],
            loading: false,
            name: '',
            found: false,
            displayCheckedInMessage: false,
            displayCheckedOutMessage: false,
            checkInDate: new Date(),
            loadingStatus: false,
            isCheckedIn: false
        }
    }
    loadPeople(name) {
        fetch('/api/people').then((results) => {
            return results.json();
        }).then((results) => {
            var filteredResults = results.filter(person => {
                return person.name.toLowerCase().indexOf(this.state.name.toLowerCase()) >= 0 
            })
            if (filteredResults.length == 1) {
                this.setPerson(filteredResults[0].name)
            } else {
                console.log(filteredResults);
            }
            this.setState({
                results: filteredResults,
                loading: false
            })
        })
    }
    clearPerson() {
        this.setState({
            name: '',
            results: [],
            found: false
        })
    }
    setPerson(name) {
        this.setState({
            name,
            found: true,
            loadingStatus: true
        })
        this.isCheckedIn();
    }
    isCheckedIn() {
        fetch('/api/isCheckedIn?'+querystring.stringify({
            name: this.state.name
        })).then((result) => {
            return result.json();
        }).then((result) => {
            this.setState({
                isCheckedIn: result.isCheckedIn,
                loadingStatus: false
            })
        })
    }
    checkIn() {
        this.setState({
            loadingStatus: true
        })
        fetch('/api/checkIn?'+querystring.stringify({
            name: this.state.name
        })).then((result) => {
            return result.json();
        }).then((result) => {
            this.setState({
                displayCheckedInMessage: true,
                checkInDate: new Date(),
                isCheckedIn: true
            })
            setTimeout(() => {
                this.setState({
                    displayCheckedInMessage: false
                })
            }, 3000)
            this.clearPerson();
        })
        
    }
    checkOut() {
        this.setState({
            loadingStatus: true
        })
        fetch('/api/checkOut?'+querystring.stringify({
            name: this.state.name
        })).then((result) => {
            return result.json();
        }).then((result) => {
            this.setState({
                displayCheckedOutMessage: true,
                checkInDate: new Date(),
                isCheckedIn: false
            })
            setTimeout(() => {
                this.setState({
                    displayCheckedOutMessage: false
                })
            }, 3000)
            this.clearPerson();
        })
    }
    findPerson() {
        this.setState({
            loading: true
        }, () => {
            this.loadPeople(this.state.name);
        })
    }
    render() {
        return (
            <div>
                <div style={{maxHeight: 150, width:'100%', textAlign: 'center'}}><div style={{width: 150, margin:'auto'}}> <Image fluid src={require('../../images/catr_logo_300.png')} /> </div></div>
                <Header textAlign="center">Volunteer Check-in and Check-out</Header>
                <Form onSubmit={() => {
 this.findPerson();
                }}><Input fluid type="text" loading={this.state.loading} disabled={this.state.found} icon={this.state.found ? "check" : null} placeholder="Name" value={this.state.name} onChange={(e) => {
                    this.setState({
                        name: e.currentTarget.value,
                        found: false
                    })
                }} /></Form>
                {this.state.found ? <div style={{marginTop: 5, height: 30}}><Button content={"Not Me"} color="blue" basic size="tiny" compact floated="right" onClick={() => {
                    this.clearPerson();
                }} /> </div>: <div style={{marginTop: 10}}>
                 <List divided link>
                 {this.state.results.map((person: Person) => {
                    return (<List.Item onClick={() => {
                        this.setPerson(person.name)
                    }} as="a">{person.name}</List.Item>)
                 })}
                </List>
                <Button fluid content="Find Me" onClick={() => {
                    this.findPerson();
                }} /></div>}
                {this.state.found ? <div style={{marginTop: 5}}>
                    {this.state.isCheckedIn ? <Button content="Check Out" fluid onClick={() => {
                        this.checkOut();
                    }} icon="calendar times outline" />: <Button content="Check In" fluid onClick={() => {
                        this.checkIn();
                    }} icon="calendar check outline" />}
                </div> : null }
                {this.state.displayCheckedInMessage ? <Message>
    <Message.Header>Checked In!</Message.Header>
    <p>
      You were successfully checked in at {dateFormat(this.state.checkInDate, "h:MM tt")}!
    </p>
  </Message> : null}
  {this.state.displayCheckedOutMessage ? <Message>
    <Message.Header>Checked Out!</Message.Header>
    <p>
      You were successfully checked out at {dateFormat(this.state.checkInDate, "h:MM tt")}!
    </p>
  </Message> : null}
            </div>
        )
    }
}

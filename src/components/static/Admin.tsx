import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Menu, Container, Segment, Header, Grid } from 'semantic-ui-react'

export default class App extends React.Component<{}, {}> {
    render() {
        return (
          <div style={{height: '100%'}}>
             <Menu pointing secondary>
          <Menu.Item name='Totals' 
           as={Link} {...{to:'/admin/totals'}}/>
           <Menu.Item name='Volunteers' 
           as={Link} {...{to:'/admin/volunteers'}}/>
           <Menu.Item name='Categories' 
           as={Link} {...{to:'/admin/categories'}}/>
          <Menu.Item
            name='Archives'
          />
          <Menu.Menu position='right'>
            <Menu.Item
              name='Check In'
              as={Link} {...{to:'/'}}
            />
          </Menu.Menu>
        </Menu>
        <div style={{overflowY: 'auto', height: 'calc(100% - 40px)', marginTop: -15}}>
            <Container>
            <Segment basic>
        {this.props.children}
        </Segment></Container>
            </div>
          
        
               
            </div>
        )
    }
}

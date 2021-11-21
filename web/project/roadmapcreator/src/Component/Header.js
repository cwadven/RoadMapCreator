import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import {withRouter} from "CustomHock/withRouter";

const Container = styled.header`
    color: while;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0px 10px;
    background-color: rgba(20, 20, 20, 0.8);
    box-shadow: 0px 1px 5px 2px rgba(0, 0, 0, 0.8);
`;

const List = styled.ul`
    display: flex;
`;

const Item = styled.li`
    width: 130px;
    color: white;
    height: 50px;
    text-align: center;
    border-bottom: 5px solid
        ${props => (props.current ? '#3498db' : 'transparent')};
`;

const SLink = styled(Link)`
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Header = (props) => {
    return (
        <Container>
            <List>
                <Item current={window.location.pathname === '/'}>
                    <SLink to={'/'}>메인페이지</SLink>
                </Item>
                <Item current={window.location.pathname === '/roadmap'}>
                    <SLink to={'/roadmap'}>로드맵</SLink>
                </Item>
            </List>
        </Container>
    );
}

export default withRouter(Header);

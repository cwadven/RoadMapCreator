import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const List = styled.ul`
    display: flex;
    &:hover {
        background-color: blue;
    }
`;

const Item = styled.li``;

const SLink = styled(Link)``;

const Header = () => {
    return (
        <header>
            <List>
                <Item>
                    <SLink to={'/'}>Home</SLink>
                </Item>
                <Item>
                    <SLink to={'/roadmap'}>RoadMap</SLink>
                </Item>
            </List>
        </header>
    );
}

export default Header;

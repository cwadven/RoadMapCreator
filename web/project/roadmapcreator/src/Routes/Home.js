import React, {useEffect, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {Link} from "react-router-dom";

const RoadMapItem = styled.div`
    margin-top: 20px;
`;

const Home = () => {
    const [roadMapSet, setRoadMapSet] = useState([]);

    useEffect(async () => {
        const {data: {roadmap_set}} = await roadMap.roadMapList();
        setRoadMapSet(roadmap_set);
    }, [])

    return (
        <div>
            {roadMapSet.length ? roadMapSet.map((data) => {
                return (
                    <RoadMapItem key={data.id}>
                        <div>순번: {data.id}</div>
                        <div>작성자: {data.username}</div>
                        <div>제목: {data.title}</div>
                        <div>설명: {data.description}</div>
                        <div>이미지: {data.image}</div>
                        <div>생성일: {new Date(data.created_at).toLocaleString()}</div>
                        <Link to={`/roadmap/${data.id}`}>자세히보기🎈</Link>
                    </RoadMapItem>
                )
            }) : null}
        </div>
    );
}

export default Home;

import React, {useEffect, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {Link} from "react-router-dom";
import CustomButton from "../Component/CustomButton";

const RoadMapItem = styled.div`
    margin: 30px 35px;
    border: 1px solid;
    padding: 20px 30px;
    border-radius: 5px;
`;

const Home = () => {
    const [roadMapSet, setRoadMapSet] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const {data: {roadmap_set}} = await roadMap.roadMapList();
            return roadmap_set
        }

        fetchData().then((roadmap_set) => {
            setRoadMapSet(roadmap_set);
        });

    }, [])

    return (
        <div>
            {roadMapSet.length ? roadMapSet.map((data) => {
                return (
                    <RoadMapItem key={data.id}>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div>ID: {data.id}</div>
                            <div>작성자: {data.username}</div>
                        </div>
                        {data.image ? <div>이미지: {data.image}</div> : ""}
                        <div style={{marginTop: "10px"}}>
                            <h3>{data.title}</h3>
                            <div style={{marginTop: "5px"}}>{data.description}</div>
                        </div>
                        <div style={{marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Link to={`/roadmap/${data.id}`}>
                                <CustomButton value={"Detail"}/>
                            </Link>
                            <div style={{marginTop: "10px", textAlign: "right"}}>{new Date(data.created_at).toLocaleString()}</div>
                        </div>
                    </RoadMapItem>
                )
            }) : null}
        </div>
    );
}

export default Home;

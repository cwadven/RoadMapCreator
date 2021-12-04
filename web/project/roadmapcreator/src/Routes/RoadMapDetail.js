import React, {useEffect, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {Link, useParams} from "react-router-dom";

const RoadMapItem = styled.div`
    margin-top: 20px;
`;

const RoadMapDetail = () => {
    const [roadMapDetail, setRoadMapDetailSet] = useState(null);
    let params = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const {data: {success}} = await roadMap.roadMapDetail(params.roadMapId);
            return success
        }

        fetchData().then((roadMapDetail) => {
            setRoadMapDetailSet(roadMapDetail);
        });

    }, [])

    return (
        <div>
            {/* 어떻게 연결할지 생각 원래 연결하는 Degree 하나로 묶어서 각각 선 만들어보기 생각중 */}
            {roadMapDetail && roadMapDetail.basenode_set.map(val => (
                <div key={val.id} style={{marginTop: 10}}>
                    <div>{val.name}</div>
                    <div>{val.description}</div>
                </div>
            ))}
            {roadMapDetail ? JSON.stringify(roadMapDetail) : null}
        </div>
    );
}

export default RoadMapDetail;

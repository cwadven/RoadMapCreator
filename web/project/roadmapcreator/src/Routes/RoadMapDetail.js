import React, {useEffect, useRef, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {Link, useParams} from "react-router-dom";

const RoadMapItem = styled.div`
    margin-top: 20px;
`;

const HEADER_PX = 60;
const OFFSET_PX = 200 + HEADER_PX * 2;
const RADIUS = 50;

const RoadMapDetail = () => {
    const [roadMapDetail, setRoadMapDetailSet] = useState(null);
    const [roadMapDegreeDetail, setRoadMapDegreeDetailSet] = useState(null);
    const baseNodeCoord = useRef({});
    let params = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const {data: {success}} = await roadMap.roadMapDetail(params.roadMapId);
            return success
        }

        fetchData().then((data) => {
            data.roadmap.basenode_set = data.roadmap.basenode_set.map(val => {
                const offset = OFFSET_PX * val.display_level;

                const leftStart = 0;
                const leftEnd = document.documentElement.clientWidth - 100;
                const randomLeftPosition = randRange(leftStart, leftEnd);

                const topStart = val.display_level * 200;
                const topEnd = (val.display_level + 1) * 200;
                const randomTopPosition = randRange(topStart + offset + 60, topEnd);

                const position = {left: randomLeftPosition, top: randomTopPosition}

                baseNodeCoord.current[val.id] = position;

                return {...val, position}
            })

            setRoadMapDetailSet(data.roadmap);
            setRoadMapDegreeDetailSet(data.degree_set);

            // 세팅하기 degree_set 을 전부 돌면서
        })

    }, [])

    console.log(roadMapDegreeDetail)

    const randRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return (
        <div>
            {/* 어떻게 연결할지 생각 원래 연결하는 Degree 하나로 묶어서 각각 선 만들어보기 생각중 */}
            {roadMapDetail && roadMapDetail.basenode_set.map(val => {
                return <div key={val.id} style={{
                    position: 'fixed',
                    left: val.position.left,
                    top: val.position.top,
                }}>
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>
                        {val.display_level}/{val.id}
                    </div>
                    <svg style={{
                        width: `${RADIUS * 2}px`,
                        height: `${RADIUS * 2}px`
                    }}>
                        <circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="#FF6F91"/>
                    </svg>
                </div>
            })}
            {/* 선 */}
            {roadMapDegreeDetail && roadMapDegreeDetail.map((val) => {
                let widthMax;
                let widthMin;

                if (baseNodeCoord.current[val.from_basenode_id].left > baseNodeCoord.current[val.to_basenode_id].left) {
                    widthMax = baseNodeCoord.current[val.from_basenode_id].left;
                    widthMin = baseNodeCoord.current[val.to_basenode_id].left;
                } else {
                    widthMax = baseNodeCoord.current[val.to_basenode_id].left;
                    widthMin = baseNodeCoord.current[val.from_basenode_id].left;
                }

                const width = widthMax - widthMin;

                let heightMax;
                let heightMin;

                if (baseNodeCoord.current[val.from_basenode_id].top > baseNodeCoord.current[val.to_basenode_id].top) {
                    heightMax = baseNodeCoord.current[val.from_basenode_id].top;
                    heightMin = baseNodeCoord.current[val.to_basenode_id].top;
                } else {
                    heightMax = baseNodeCoord.current[val.to_basenode_id].top;
                    heightMin = baseNodeCoord.current[val.from_basenode_id].top;
                }

                const height = heightMax - heightMin;

                let x1;
                let y1;
                let x2;
                let y2;
                let reverse;

                if (baseNodeCoord.current[val.from_basenode_id].left > baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top > baseNodeCoord.current[val.from_basenode_id].top) {
                    // 뒤집기
                    // 화살표 방향 : 위 -> 아래 / 오른쪽 -> 왼쪽
                    x1 = 0;
                    y1 = height;
                    x2 = width;
                    y2 = 0;
                    reverse = true;
                } else if (baseNodeCoord.current[val.from_basenode_id].left < baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top < baseNodeCoord.current[val.from_basenode_id].top) {
                    // 뒤집기 :
                    // 화살표 방향 : 아래 -> 위 / 왼쪽 -> 오른쪽
                    x1 = width;
                    y1 = 0;
                    x2 = 0;
                    y2 = height;
                    reverse = true;
                } else if (baseNodeCoord.current[val.from_basenode_id].left < baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top > baseNodeCoord.current[val.from_basenode_id].top) {
                    // 뒤집지 않기 :
                    // 화살표 방향 : 위 -> 아래 / 왼쪽 -> 오른쪽
                    x1 = 0;
                    y1 = 0;
                    x2 = width;
                    y2 = height;
                    reverse = false;
                } else if (baseNodeCoord.current[val.from_basenode_id].left > baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top < baseNodeCoord.current[val.from_basenode_id].top) {
                    // 뒤집지 않기 :
                    // 화살표 방향 : 아래 -> 위 / 오른쪽 -> 왼쪽
                    x1 = width;
                    y1 = height;
                    x2 = 0;
                    y2 = 0;
                    reverse = false;
                }

                return (
                    <svg key={val.id} style={{
                        position: "fixed",
                        width: width,
                        height: height,
                        left: widthMin + RADIUS,
                        top: heightMin + RADIUS
                    }}>
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                                    markerWidth="5" markerHeight="5"
                                    orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z"/>
                            </marker>
                        </defs>
                        <polyline
                            points={`${x1},${y1} ${x2},${y2}`}
                            fill="none"
                            stroke-width="2"
                            stroke="grey"
                            marker-start={reverse ? "url(#arrow)" : ""}
                            marker-end={reverse ? "" : "url(#arrow)"}
                        />
                    </svg>
                )
            })}
        </div>
    );
}

export default RoadMapDetail;

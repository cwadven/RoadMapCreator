import React, {useEffect, useRef, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {Link, useParams} from "react-router-dom";


const NodeSvg = styled.svg`
`;

const NodeCircle = styled.circle`
`;

const NodeDiv = styled.div`
    // z-index: 1000;
    
    &:hover ${NodeCircle}{
        fill: red;
    }
`


const HEADER_PX = 60;
const OFFSET_PX = 200 + HEADER_PX * 2;
const RADIUS = 50;

const RoadMapDetail = () => {
    const [roadMapDetail, setRoadMapDetailSet] = useState(null);
    const [roadMapDegreeDetail, setRoadMapDegreeDetailSet] = useState(null);
    const baseNodeCoord = useRef({});
    let params = useParams();

    const randRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        const fetchData = async () => {
            const {data: {success}} = await roadMap.roadMapDetail(params.roadMapId);
            return success
        }

        fetchData().then((data) => {
            data.roadmap.basenode_set = data.roadmap.basenode_set.map(val => {
                const offset = OFFSET_PX * val.display_level;

                let leftStart;
                let leftEnd;
                let randomLeftPosition;
                let topStart;
                let topEnd;
                let randomTopPosition;
                let isIntersect = true;

                // Node 가 겹치지 않도록 떨어지도록 설정
                while (isIntersect) {
                    leftStart = 0;
                    leftEnd = document.documentElement.clientWidth - 100;
                    randomLeftPosition = randRange(leftStart, leftEnd);

                    topStart = val.display_level * 200;
                    topEnd = (val.display_level + 1) * 200;
                    randomTopPosition = randRange(topStart + offset + 60, topEnd);

                    isIntersect = Object.values(baseNodeCoord.current).some((obj) => {
                        if (Math.sqrt(Math.pow(obj.left - randomLeftPosition, 2) + Math.pow(obj.top - randomTopPosition, 2)) > RADIUS * 2) {
                            return false
                        }
                        return true
                    })
                }

                const position = {left: randomLeftPosition, top: randomTopPosition}

                baseNodeCoord.current[val.id] = position;

                return {...val, position}
            })

            setRoadMapDetailSet(data.roadmap);
            setRoadMapDegreeDetailSet(data.degree_set);

            // 세팅하기 degree_set 을 전부 돌면서
        })

    }, [])

    return (
        <div>
            {/* 겹치지 않도록 설정하기 */}
            {roadMapDetail && roadMapDetail.basenode_set.map(val => {
                return (
                    <NodeDiv key={val.id} style={{
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
                            L:{val.display_level}/ID:{val.id}
                        </div>
                        <NodeSvg style={{
                            width: `${RADIUS * 2}px`,
                            height: `${RADIUS * 2}px`
                        }}>
                            <NodeCircle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="#FF6F91"/>
                        </NodeSvg>
                    </NodeDiv>
                )
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
                        // 잘려서 보이는 현상으로 + 5 정도 추가
                        width: width + 5,
                        height: height + 5,
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
                            strokeWidth="2"
                            stroke="grey"
                            markerStart={reverse ? "url(#arrow)" : ""}
                            markerEnd={reverse ? "" : "url(#arrow)"}
                        />
                    </svg>
                )
            })}
        </div>
    );
}

export default RoadMapDetail;

import React, {useEffect, useRef, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {Link, useParams} from "react-router-dom";


const NodeSvg = styled.svg`
`;

const NodeCircle = styled.circle`
`;

const NodeDiv = styled.div`
    z-index: 1000;
    
    &:hover ${NodeCircle}{
        fill: red;
    }
`


const HEADER_PX = 60;
const LEVEL_OFFSET_PX = 200 + HEADER_PX * 2;
const RADIUS = 50;
const NODE_MARGIN = RADIUS * 2.5;
const DEGREE_PADDING = RADIUS + 10;

const RoadMapDetail = () => {
    const [roadMapDetail, setRoadMapDetailSet] = useState(null);
    const [roadMapDegreeDetail, setRoadMapDegreeDetailSet] = useState(null);
    const baseNodeCoord = useRef({});
    let params = useParams();

    const randRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const calcAngle = (x, y) => {
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    useEffect(() => {
        const fetchData = async () => {
            const {data: {success}} = await roadMap.roadMapDetail(params.roadMapId);
            return success
        }

        fetchData().then((data) => {
            data.roadmap.basenode_set = data.roadmap.basenode_set.map(val => {
                const offset = LEVEL_OFFSET_PX * val.display_level;

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
                        if (Math.sqrt(Math.pow(obj.left - randomLeftPosition, 2) + Math.pow(obj.top - randomTopPosition, 2)) > NODE_MARGIN) {
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
                // 만드는 선에서 50 px 더 적게 양쪽
                let widthMax;
                let widthMin;

                // Math.pow(baseNodeCoord.current[val.from_basenode_id].left - ??, 2) + Math.pow(baseNodeCoord.current[val.from_basenode_id].top - ??, 2)
                // 각도 알기기
                let angle;

                let x_1;
                let x_2;

                // Node 가 오른쪽
                if (baseNodeCoord.current[val.from_basenode_id].left > baseNodeCoord.current[val.to_basenode_id].left) {
                    widthMax = baseNodeCoord.current[val.from_basenode_id].left;
                    widthMin = baseNodeCoord.current[val.to_basenode_id].left;
                    x_1 = widthMax;
                    x_2 = widthMin;
                } else {
                    // Node 가 왼쪽
                    widthMax = baseNodeCoord.current[val.to_basenode_id].left;
                    widthMin = baseNodeCoord.current[val.from_basenode_id].left;
                    x_1 = widthMin;
                    x_2 = widthMax;
                }

                let width = widthMax - widthMin;

                let heightMax;
                let heightMin;
                let y_1;
                let y_2;

                // Node 가 아래쪽
                if (baseNodeCoord.current[val.from_basenode_id].top > baseNodeCoord.current[val.to_basenode_id].top) {
                    heightMax = baseNodeCoord.current[val.from_basenode_id].top;
                    heightMin = baseNodeCoord.current[val.to_basenode_id].top;
                    y_1 = heightMax;
                    y_2 = heightMin;
                } else {
                    // Node 가 위쪽
                    heightMax = baseNodeCoord.current[val.to_basenode_id].top;
                    heightMin = baseNodeCoord.current[val.from_basenode_id].top;
                    y_1 = heightMin;
                    y_2 = heightMax;
                }

                let height = heightMax - heightMin;

                if (x_1 > x_2) {
                    angle = Math.abs(calcAngle(x_1 - x_2, y_1 - y_2));
                } else {
                    angle = Math.abs(calcAngle(x_2 - x_1, y_2 - y_1));
                }

                const forCos = Math.abs(Math.cos(angle * Math.PI / 180) * DEGREE_PADDING);
                const forSin = Math.abs(Math.sin(angle * Math.PI / 180) * DEGREE_PADDING);

                console.log(width, height)
                console.log("angle", angle)
                console.log(`Math.cos(${angle}) * ${RADIUS}`);
                console.log(`Math.sin(${angle}) * ${RADIUS}`);
                console.log("cos => ", forCos, "from", val.from_basenode_id, "to", val.to_basenode_id)
                console.log("sin => ", forSin, "from", val.from_basenode_id, "to", val.to_basenode_id)
                console.log("--------")

                let x1;
                let y1;
                let x2;
                let y2;

                if (baseNodeCoord.current[val.from_basenode_id].left > baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top > baseNodeCoord.current[val.from_basenode_id].top) {
                    x1 = width - forCos;
                    y1 = 0 + forSin;
                    x2 = 0 + forCos;
                    y2 = height - forSin;

                    height += forSin;
                    width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id].left < baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top < baseNodeCoord.current[val.from_basenode_id].top) {
                    // 화살표 방향 : 아래 -> 위 / 왼쪽 -> 오른쪽
                    x1 = 0 + forCos;
                    y1 = height - forSin;
                    x2 = width - forCos;
                    y2 = 0 + forSin;

                    height += forSin;
                    width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id].left < baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top > baseNodeCoord.current[val.from_basenode_id].top) {
                    // 화살표 방향 : 위 -> 아래 / 왼쪽 -> 오른쪽
                    x1 = 0 + forCos;
                    y1 = 0 + forSin;
                    x2 = width - forCos;
                    y2 = height - forSin;

                    height += forSin;
                    width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id].left > baseNodeCoord.current[val.to_basenode_id].left && baseNodeCoord.current[val.to_basenode_id].top < baseNodeCoord.current[val.from_basenode_id].top) {
                    // 화살표 방향 : 아래 -> 위 / 오른쪽 -> 왼쪽
                    x1 = width - forCos;
                    y1 = height - forSin;
                    x2 = 0 + forCos;
                    y2 = 0 + forSin;

                    height += forSin;
                    width += forCos;
                }

                return (
                    <svg key={val.id} style={{
                        position: "fixed",
                        // 잘려서 보이는 현상으로 + 5 정도 추가
                        width: width + 5,
                        height: height + 5,
                        left: widthMin + RADIUS,
                        top: heightMin + RADIUS,
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
                            markerEnd="url(#arrow)"
                        />
                    </svg>
                )
            })}
        </div>
    );
}

export default RoadMapDetail;

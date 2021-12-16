import React, {useEffect, useMemo, useRef, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {useParams} from "react-router-dom";


const NodeSvg = styled.svg`
`;

const NodeCircle = styled.circle`
`;

const NodeTransparentCircle = styled.circle`
    // fill-opacity: 0;
`;

const NodeDiv = styled.div`
    // z-index: 1000;
    
    &:hover ${NodeCircle}{
        fill: red;
    }
`

const NodeTransparentDiv = styled.div`
    &:hover ${NodeCircle}{
        fill: red;
    }
`

const DegreeWeightDiv = styled.div`
`;

const DegreeDiv = styled.div`
    // z-index: 1000;
    
    // &:hover ${DegreeWeightDiv}{
    //     color: red;
    // }
`

const DegreePolyLine = styled.polyline`
`;


const HEADER_PX = 150;
const LEVEL_OFFSET_PX = 50 + HEADER_PX * 2;
const RADIUS = 50;
const NODE_MARGIN = RADIUS * 2.5;
const DEGREE_PADDING = RADIUS + 10;
const DEFAULT_COLOR = "#FF6F91";

const RoadMapDetail = () => {
    const [height, setHeight] = useState(window.innerHeight + RADIUS);

    const [roadMapDetail, setRoadMapDetailSet] = useState(null);
    const [roadMapDegreeDetail, setRoadMapDegreeDetailSet] = useState(null);
    const baseNodeCoord = useRef({});

    const startBasenodeId = useRef(null);
    const endBasenodeId = useRef(null);

    // 기본 색깔 정보 넣기
    const onCircleTouchOrOverAction = useMemo(() => {
        return (id) => {
            let all_to = roadMapDegreeDetail && roadMapDegreeDetail.filter((data) => data?.from_basenode_id == id);

            const findNextNodePaint = (color) => {
                all_to && all_to.forEach((data) => {
                    if (color == "current") {
                        document.getElementById(`circle_${data.to_basenode_id}`).style.fill = baseNodeCoord.current[data.to_basenode_id]["currentColor"];
                    } else {
                        document.getElementById(`circle_${data.to_basenode_id}`).style.fill = color;
                    }
                });
            };

            return {
                onMouseOver: (e) => {
                    findNextNodePaint("yellow");
                    document.getElementById(`circle_${id}`).style.fill = "red";
                    e.preventDefault();
                },
                onMouseOut: (e) => {
                    findNextNodePaint("current");
                    document.getElementById(`circle_${id}`).style.fill = baseNodeCoord.current[id]["currentColor"];
                    e.preventDefault();
                },
                // onTouchStart: () => {
                //     findNextNodePaint("yellow");
                //     document.getElementById(`circle_${id}`).style.fill = "red";
                // },
                // onTouchEnd: () => {
                //     findNextNodePaint("#FF6F91");
                //     document.getElementById(`circle_${id}`).style.fill = "#FF6F91";
                // }
            }
        }
    }, [roadMapDegreeDetail]);

    const [shortestWeight, setShortestWeight] = useState(null);

    let params = useParams();

    const randRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const calcAngle = (x, y) => {
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    const setAllPolyLineDefaultColor = () => {
        document.querySelectorAll('polyline').forEach((polyline) => {
            console.log(polyline)
            polyline.style.stroke = 'grey';
        });
    }

    const setAllCircleDefaultColor = () => {
        Object.keys(baseNodeCoord.current).forEach((baseNodeId) => {
            document.querySelector(`#circle_${baseNodeId}`).style.fill = baseNodeCoord.current[baseNodeId]["defaultColor"];
        });
    }

    const setShortestPathCircleColor = (data) => {
        data?.basenode_id_shortest_path.forEach((basenode_id) => {
            document.querySelector(`#circle_${basenode_id}`).style.fill = "#FFC75F";
            baseNodeCoord.current[basenode_id]["currentColor"] = "#FFC75F";
        });

        document.querySelector(`#circle_${startBasenodeId.current.value}`).style.fill = "#F3C5FF";
        baseNodeCoord.current[startBasenodeId.current.value]["currentColor"] = "#F3C5FF";

        document.querySelector(`#circle_${endBasenodeId.current.value}`).style.fill = "#F3C5FF";
        baseNodeCoord.current[endBasenodeId.current.value]["currentColor"] = "#F3C5FF";
    }

    const setShortestPathPolyLineColor = (data) => {
        data?.basenode_degree_shortest_connection_set.forEach((degree) => {
            document.querySelector(`#degree_${degree.id}`).style.stroke = "red";
        });
    }

    const findShortestPath = async () => {
        setAllCircleDefaultColor();
        setAllPolyLineDefaultColor();

        if (startBasenodeId.current.value && endBasenodeId.current.value) {
            const queryParams = {
                start_basenode_id: startBasenodeId.current.value,
                end_basenode_id: endBasenodeId.current.value,
            }

            const {data: {success}} = await roadMap.findShortestPath(
                params.roadMapId,
                queryParams,
            ).catch((error) => {
                alert(error.response.data.detail);
                return {data: {success: false}};
            });

            if (!success) {
                return;
            }

            setShortestWeight(success.total_weight);
            setShortestPathCircleColor(success);
            setShortestPathPolyLineColor(success);
        } else {
            alert("시작ID, 도착ID 를 입력하세요!");
        }
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
                    randomTopPosition = randRange(topStart + offset + HEADER_PX, topEnd + offset + HEADER_PX);

                    isIntersect = Object.values(baseNodeCoord.current).some((obj) => {
                        if (Math.sqrt(Math.pow(obj.position.left - randomLeftPosition, 2) + Math.pow(obj.position.top - randomTopPosition, 2)) > NODE_MARGIN) {
                            return false
                        }
                        return true
                    })
                }

                const position = {left: randomLeftPosition, top: randomTopPosition}

                baseNodeCoord.current[val.id] = {
                    position,
                    defaultColor: val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR,
                    currentColor: val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR,
                };

                return {...val, position, currentColor: val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR}
            })

            setRoadMapDetailSet(data.roadmap);
            setRoadMapDegreeDetailSet(data.degree_set);

            // 세팅하기 degree_set 을 전부 돌면서
        })

    }, [])

    return (
        <div style={{height: height}}>
            {/* 겹치지 않도록 설정하기 */}
            {roadMapDetail && roadMapDetail.basenode_set.map(val => {
                return (
                    <NodeDiv key={val.id} style={{
                        position: 'absolute',
                        left: val.position.left,
                        top: val.position.top,
                    }}>
                        <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "fit-content",
                        }}>
                            {val.name}
                        </div>
                        <div style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            fontWeight: "bold"
                        }}>
                            {val.id}
                        </div>
                        <NodeSvg style={{
                            width: `${RADIUS * 2}px`,
                            height: `${RADIUS * 2}px`
                        }}>
                            <NodeCircle id={`circle_${val.id}`} cx={RADIUS} cy={RADIUS} r={RADIUS}
                                        fill={val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR}/>
                        </NodeSvg>
                    </NodeDiv>
                )
            })}
            {/* 선 */}
            {roadMapDegreeDetail && roadMapDegreeDetail.map((val) => {
                // 만드는 선에서 50 px 더 적게 양쪽
                let widthMax;
                let widthMin;

                // 각도 알기기
                let angle;

                let x_1;
                let x_2;

                // Node 가 오른쪽
                if (baseNodeCoord.current[val.from_basenode_id]["position"].left > baseNodeCoord.current[val.to_basenode_id]["position"].left) {
                    widthMax = baseNodeCoord.current[val.from_basenode_id]["position"].left;
                    widthMin = baseNodeCoord.current[val.to_basenode_id]["position"].left;
                    x_1 = widthMax;
                    x_2 = widthMin;
                } else {
                    // Node 가 왼쪽
                    widthMax = baseNodeCoord.current[val.to_basenode_id]["position"].left;
                    widthMin = baseNodeCoord.current[val.from_basenode_id]["position"].left;
                    x_1 = widthMin;
                    x_2 = widthMax;
                }

                let width = widthMax - widthMin;

                let heightMax;
                let heightMin;
                let y_1;
                let y_2;

                // Node 가 아래쪽
                if (baseNodeCoord.current[val.from_basenode_id]["position"].top > baseNodeCoord.current[val.to_basenode_id]["position"].top) {
                    heightMax = baseNodeCoord.current[val.from_basenode_id]["position"].top;
                    heightMin = baseNodeCoord.current[val.to_basenode_id]["position"].top;
                    y_1 = heightMax;
                    y_2 = heightMin;
                } else {
                    // Node 가 위쪽
                    heightMax = baseNodeCoord.current[val.to_basenode_id]["position"].top;
                    heightMin = baseNodeCoord.current[val.from_basenode_id]["position"].top;
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

                let x1;
                let y1;
                let x2;
                let y2;

                if (baseNodeCoord.current[val.from_basenode_id]["position"].left > baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top > baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 위 -> 아래 / 오른쪽 -> 왼쪽
                    x1 = width - forCos;
                    y1 = 0 + forSin;
                    x2 = 0 + forCos;
                    y2 = height - forSin;

                    // height += forSin;
                    // width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id]["position"].left < baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top < baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 아래 -> 위 / 왼쪽 -> 오른쪽
                    x1 = 0 + forCos;
                    y1 = height - forSin;
                    x2 = width - forCos;
                    y2 = 0 + forSin;

                    // height += forSin;
                    // width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id]["position"].left < baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top > baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 위 -> 아래 / 왼쪽 -> 오른쪽
                    x1 = 0 + forCos;
                    y1 = 0 + forSin;
                    x2 = width - forCos;
                    y2 = height - forSin;

                    // height += forSin;
                    // width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id]["position"].left > baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top < baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 아래 -> 위 / 오른쪽 -> 왼쪽
                    x1 = width - forCos;
                    y1 = height - forSin;
                    x2 = 0 + forCos;
                    y2 = 0 + forSin;

                    // height += forSin;
                    // width += forCos;
                }

                return (
                    <DegreeDiv key={val.id} style={{
                        position: "absolute",
                        left: widthMin + RADIUS,
                        top: heightMin + RADIUS,
                    }}>
                        <DegreeWeightDiv id={`weight_${val.id}`} style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            borderRadius: "60%",
                            zIndex: 999,
                            padding: "5px",
                        }}>
                            {val.weight}
                        </DegreeWeightDiv>
                        <svg key={val.id} style={{
                            // 잘려서 보이는 현상으로 + 5 정도 추가
                            width: width + 5,
                            height: height + 5,
                        }}>
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                                        markerWidth="5" markerHeight="5"
                                        orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z"/>
                                </marker>
                            </defs>
                            <DegreePolyLine
                                id={`degree_${val.id}`}
                                points={`${x1},${y1} ${x2},${y2}`}
                                fill="none"
                                strokeWidth="2"
                                stroke="grey"
                                markerEnd="url(#arrow)"
                            />
                        </svg>
                    </DegreeDiv>
                )
            })}
            {/* 안보이는 것 노드 똑같이 */}
            {roadMapDetail && roadMapDetail.basenode_set.map(val => {
                return (
                    <NodeTransparentDiv key={val.id} style={{
                        position: 'absolute',
                        left: val.position.left,
                        top: val.position.top,
                    }}>
                        <NodeSvg style={{
                            width: `${RADIUS * 2}px`,
                            height: `${RADIUS * 2}px`
                        }}>
                            <NodeTransparentCircle
                                cx={RADIUS}
                                cy={RADIUS}
                                r={RADIUS}
                                fill="#00000000"
                                {...onCircleTouchOrOverAction(val.id)}
                            />
                        </NodeSvg>
                    </NodeTransparentDiv>
                )
            })}
            <div style={{background: "white", padding: "10px"}}>
                <div style={{marginBottom: "10px"}}>
                    시작 ID: <input type="number" name="startBasenodeId" ref={startBasenodeId}/>
                    도착 ID: <input type="number" name="endBasenodeId" ref={endBasenodeId}/>
                </div>
                <div>
                    <button onClick={findShortestPath}>
                        최단 거리 선택하기
                    </button>
                    {shortestWeight !== null && shortestWeight + "걸림"}
                </div>
            </div>
        </div>
    );
}

export default RoadMapDetail;

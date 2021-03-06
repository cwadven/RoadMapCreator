import React, {useEffect, useMemo, useRef, useState} from 'react';
import {roadMap} from "api";
import styled from 'styled-components';
import {useParams} from "react-router-dom";
import CustomButton from "../Component/CustomButton";


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
`;

const NodeTransparentDiv = styled.div`
    &:hover ${NodeCircle}{
        fill: red;
    }
`;

const DegreeWeightDiv = styled.div`
`;

const DegreeDiv = styled.div`
    // z-index: 1000;
    
    // &:hover ${DegreeWeightDiv}{
    //     color: red;
    // }
`;

const DegreePolyLine = styled.polyline`
`;

const HEADER_PX = 240;
const LEVEL_OFFSET_PX = 30 + HEADER_PX * 1;
// 반지름
const RADIUS = 30;
// Node 끼리 떨어지는 정도
const NODE_MARGIN = RADIUS * 3;
// Level 마다 떨어지는 Height 조정
const LEVEL_MARGIN = 50;
const DEGREE_PADDING = RADIUS + 10;
const DEFAULT_COLOR = "#FF6F91";
const DEGREE_DEFAULT_COLOR = "grey";

const EndStartColor = "#F3C5FF";

const RoadMapDetail = () => {
    const [height, setHeight] = useState(window.innerHeight + RADIUS);

    const [roadMapDetail, setRoadMapDetailSet] = useState(null);
    const [roadMapDegreeDetail, setRoadMapDegreeDetailSet] = useState(null);
    const baseNodeCoord = useRef({});
    const degreeInfo = useRef({});

    const startBasenodeId = useRef(null);
    const endBasenodeId = useRef(null);

    // Node 클릭 시, input 값 넣기 제어용
    const startOrEndInputPointer = useRef(null);
    // input 클릭 후, Node 클릭 시, input 값 넣기 제어용
    const inputFillPointer = useRef("");

    // Circle 을 hover 했을 경우
    const onCircleTouchOrOverAction = useMemo(() => {
        return (id) => {
            let all_to = roadMapDegreeDetail && roadMapDegreeDetail.filter((data) => data?.from_basenode_id === id);

            const findNextNodePaint = (color) => {
                all_to && all_to.forEach((data) => {
                    if (color === "current") {
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
                onTouchStart: (e) => {
                    findNextNodePaint("yellow");
                    document.getElementById(`circle_${id}`).style.fill = "red";
                    e.preventDefault();
                },
                onTouchEnd: (e) => {
                    findNextNodePaint("current");
                    document.getElementById(`circle_${id}`).style.fill = baseNodeCoord.current[id]["currentColor"];
                    e.preventDefault();
                }
            };
        };
    }, [roadMapDegreeDetail]);

    // Circle 을 hover 했을 경우
    const onCircleClickThenOutAction = useMemo(() => {

        const setNextInputValue = (id) => {
            if (inputFillPointer.current === "start") {
                endBasenodeId.current.style.borderColor = "green";
                startBasenodeId.current.style.borderColor = "";
                startBasenodeId.current.value = id;
                startOrEndInputPointer.current = 1;
                inputFillPointer.current = "";
            } else if (inputFillPointer.current === "end") {
                startBasenodeId.current.style.borderColor = "green";
                endBasenodeId.current.style.borderColor = "";
                endBasenodeId.current.value = id;
                startOrEndInputPointer.current = 0;
                inputFillPointer.current = "";
            } else {
                if (!!!startOrEndInputPointer.current) {
                    endBasenodeId.current.style.borderColor = "green";
                    startBasenodeId.current.style.borderColor = "";
                    startBasenodeId.current.value = id;
                    startOrEndInputPointer.current = 1;
                } else {
                    startBasenodeId.current.style.borderColor = "green";
                    endBasenodeId.current.style.borderColor = "";
                    endBasenodeId.current.value = id;
                    startOrEndInputPointer.current = 0;
                }
            }
        };

        return (id) => {
            return {
                onMouseUp: (e) => {
                    e.preventDefault();
                    setNextInputValue(id);
                },
                onTouchEndCapture: (e) => {
                    e.preventDefault();
                    setNextInputValue(id);
                }
            };
        };
    }, [roadMapDegreeDetail]);

    // Weight 를 hover 했을 경우
    const onWeightTouchOrOverAction = useMemo(() => {
        return (id) => {

            return {
                onMouseOver: (e) => {
                    document.getElementById(`degree_${id}`).style.stroke = "red";
                    e.preventDefault();
                },
                onMouseOut: (e) => {
                    document.getElementById(`degree_${id}`).style.stroke = degreeInfo.current[id]["currentColor"];
                    e.preventDefault();
                },
                onTouchStart: (e) => {
                    document.getElementById(`degree_${id}`).style.stroke = "red";
                    e.preventDefault();
                },
                onTouchEnd: (e) => {
                    document.getElementById(`degree_${id}`).style.stroke = degreeInfo.current[id]["currentColor"];
                    e.preventDefault();
                }
            };
        };
    }, [roadMapDegreeDetail]);

    const [shortestWeight, setShortestWeight] = useState(null);

    let params = useParams();

    const randRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const calcAngle = (x, y) => {
        return Math.atan2(y, x) * 180 / Math.PI;
    };

    const setAllPolyLineDefaultColor = () => {
        Object.keys(degreeInfo.current).forEach((degreeId) => {
            document.querySelector(`#degree_${degreeId}`).style.stroke = degreeInfo.current[degreeId]["defaultColor"];
            degreeInfo.current[degreeId]["currentColor"] = degreeInfo.current[degreeId]["defaultColor"];
        });
    };

    const setAllCircleDefaultColor = () => {
        Object.keys(baseNodeCoord.current).forEach((baseNodeId) => {
            document.querySelector(`#circle_${baseNodeId}`).style.fill = baseNodeCoord.current[baseNodeId]["defaultColor"];
            baseNodeCoord.current[baseNodeId]["currentColor"] = baseNodeCoord.current[baseNodeId]["defaultColor"];
        });
    };

    const setShortestPathCircleColor = (data) => {
        data?.basenode_id_shortest_path.forEach((basenode_id) => {
            document.querySelector(`#circle_${basenode_id}`).style.fill = "#FFC75F";
            baseNodeCoord.current[basenode_id]["currentColor"] = "#FFC75F";
        });

        document.querySelector(`#circle_${startBasenodeId.current.value}`).style.fill = EndStartColor;
        baseNodeCoord.current[startBasenodeId.current.value]["currentColor"] = EndStartColor;

        document.querySelector(`#circle_${endBasenodeId.current.value}`).style.fill = EndStartColor;
        baseNodeCoord.current[endBasenodeId.current.value]["currentColor"] = EndStartColor;
    };

    const setShortestPathPolyLineColor = (data) => {
        data?.basenode_degree_shortest_connection_set.forEach((degree) => {
            document.querySelector(`#degree_${degree.id}`).style.stroke = "red";
            degreeInfo.current[degree.id]["currentColor"] = "red";
        });
    };

    const findShortestPath = async () => {
        setAllCircleDefaultColor();
        setAllPolyLineDefaultColor();
        let message = "";

        if (startBasenodeId.current.value && endBasenodeId.current.value) {
            const queryParams = {
                start_basenode_id: startBasenodeId.current.value,
                end_basenode_id: endBasenodeId.current.value,
            };

            const {data: {success}} = await roadMap.findShortestPath(
                params.roadMapId,
                queryParams,
            ).catch((error) => {
                alert(error.response.data.detail);
                return {data: {success: false}};
            });

            if (!success) {
                setShortestWeight(null);
                return;
            }

            setShortestWeight(success.total_weight);
            setShortestPathCircleColor(success);
            setShortestPathPolyLineColor(success);
        } else {
            if (!endBasenodeId.current.value) {
                message = "도착 ID " + message;
                endBasenodeId.current.focus();
            }
            if (!startBasenodeId.current.value) {
                message = "시작 ID " + message;
                startBasenodeId.current.focus();
            }
            message = message + "를 입력 하세요!";
            setShortestWeight(null);
            alert(message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const {data: {success}} = await roadMap.roadMapDetail(params.roadMapId);
            return success;
        };

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
                let nodeMarginPlus = 0;

                // Node 가 겹치지 않도록 떨어지도록 설정
                while (isIntersect) {
                    leftStart = 0;
                    leftEnd = document.documentElement.clientWidth - 100;
                    randomLeftPosition = randRange(leftStart, leftEnd);

                    topStart = val.display_level * LEVEL_MARGIN;
                    topEnd = (val.display_level + 1) * LEVEL_MARGIN;
                    randomTopPosition = randRange(topStart + offset + HEADER_PX, topEnd + offset + HEADER_PX);

                    isIntersect = Object.values(baseNodeCoord.current).some((obj) => {
                        if (Math.sqrt(Math.pow(obj.position.left - randomLeftPosition, 2) + Math.pow(obj.position.top - randomTopPosition, 2)) > NODE_MARGIN - nodeMarginPlus) {
                            return false;
                        }
                        nodeMarginPlus += 1;
                        return true;
                    });
                }

                const position = {left: randomLeftPosition, top: randomTopPosition};

                baseNodeCoord.current[val.id] = {
                    position,
                    defaultColor: val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR,
                    currentColor: val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR,
                };

                return {...val, position, currentColor: val.hex_color_code ? val.hex_color_code : DEFAULT_COLOR};
            });

            // 선 색깔 초기화
            data.degree_set.forEach(val => {
                degreeInfo.current[val.id] = {
                    defaultColor: DEGREE_DEFAULT_COLOR,
                    currentColor: DEGREE_DEFAULT_COLOR,
                };
            });

            setRoadMapDetailSet(data.roadmap);
            setRoadMapDegreeDetailSet(data.degree_set);

            // 세팅하기 degree_set 을 전부 돌면서
        });

    }, []);

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
                            fontSize: "12px",
                            transform: "translate(-50%, -50%)",
                            width: "fit-content",
                        }}>
                            {val.name}
                        </div>
                        <div style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            fontStyle: "italic",
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
                );
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

                if (baseNodeCoord.current[val.from_basenode_id]["position"].left > baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top >= baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 위 -> 아래 / 오른쪽 -> 왼쪽
                    x1 = width - forCos;
                    y1 = 0 + forSin;
                    x2 = 0 + forCos;
                    y2 = height - forSin;

                    // height += forSin;
                    // width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id]["position"].left < baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top <= baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 아래 -> 위 / 왼쪽 -> 오른쪽
                    x1 = 0 + forCos;
                    y1 = height - forSin;
                    x2 = width - forCos;
                    y2 = 0 + forSin;

                    // height += forSin;
                    // width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id]["position"].left < baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top >= baseNodeCoord.current[val.from_basenode_id]["position"].top) {
                    // 화살표 방향 : 위 -> 아래 / 왼쪽 -> 오른쪽
                    x1 = 0 + forCos;
                    y1 = 0 + forSin;
                    x2 = width - forCos;
                    y2 = height - forSin;

                    // height += forSin;
                    // width += forCos;
                } else if (baseNodeCoord.current[val.from_basenode_id]["position"].left > baseNodeCoord.current[val.to_basenode_id]["position"].left && baseNodeCoord.current[val.to_basenode_id]["position"].top <= baseNodeCoord.current[val.from_basenode_id]["position"].top) {
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
                            background: "transparent",
                            borderRadius: "60%",
                            zIndex: 998,
                            padding: "5px",
                            fontWeight: "bold"
                        }}
                                         {...onWeightTouchOrOverAction(val.id)}>
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
                );
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
                                {...onCircleClickThenOutAction(val.id)}
                            />
                        </NodeSvg>
                    </NodeTransparentDiv>
                );
            })}
            <div style={{
                position: "sticky",
                top: 50,
                background: "#f4f4f4",
                padding: "10px",
                textAlign: "center",
                zIndex: 999
            }}>
                <div style={{marginBottom: "10px"}}>
                    <input
                        style={{padding: "10px"}}
                        type="number"
                        name="startBasenodeId"
                        placeholder={"시작 ID"}
                        ref={startBasenodeId}
                        onClick={() => {
                            startBasenodeId.current.style.borderColor = "green";
                            endBasenodeId.current.style.borderColor = "";
                            inputFillPointer.current = "start";
                        }}
                        onTouchStart={() => {
                            startBasenodeId.current.style.borderColor = "green";
                            endBasenodeId.current.style.borderColor = "";
                            inputFillPointer.current = "start";
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                findShortestPath();
                            }
                        }}/>
                </div>
                <div style={{marginBottom: "10px"}}>
                    <input
                        style={{padding: "10px"}}
                        type="number"
                        name="endBasenodeId"
                        placeholder={"도착 ID"}
                        ref={endBasenodeId}
                        onClick={() => {
                            endBasenodeId.current.style.borderColor = "green";
                            startBasenodeId.current.style.borderColor = "";
                            inputFillPointer.current = "end";
                        }}
                        onTouchStart={() => {
                            endBasenodeId.current.style.borderColor = "green";
                            startBasenodeId.current.style.borderColor = "";
                            inputFillPointer.current = "end";
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                findShortestPath();
                            }
                        }}/>
                </div>
                <div>
                    <CustomButton value={"최단 거리 확인하기"} onClick={findShortestPath}/>
                </div>
                <div style={{marginTop: "10px"}}>
                    {shortestWeight !== null &&
                    <span style={{marginLeft: "10px", fontWeight: "bold"}}>{`최소 ${shortestWeight} 걸림`}</span>}
                </div>
            </div>
        </div>
    );
};

export default RoadMapDetail;

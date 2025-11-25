import React from "react";

/**
 * Deck.gl hover 이벤트에서 넘어오는 hoveredObj를 받아
 * 셀 이름, 높이, ID, carbon 값 등을 툴팁으로 보여주는 컴포넌트
 *
 * props:
 *  - hoveredObj: { x, y, object } 형태 (Deck.gl onHover 이벤트 그대로)
 */
export default function LayerHoveredTooltip({ hoveredObj }) {
    if (!hoveredObj || !hoveredObj.object) return null;

    const { x, y, object } = hoveredObj;
    const props = object.properties || {};

    const {
        name,
        type,      // ← 추가
        height,
        id,
        interactive,
        carbon,
    } = props;

    const style = {
        position: "absolute",
        left: x + 10,
        top: y + 10,
        background: "rgba(0, 0, 0, 0.8)",
        color: "#ffffff",
        padding: "6px 8px",
        borderRadius: 4,
        fontSize: 12,
        lineHeight: 1.4,
        pointerEvents: "none",
        zIndex: 9999,
        maxWidth: 220,
    };

    const heightVal = Array.isArray(height) ? height[1] : height;

    return (
        <div style={style}>
            {name && <div><strong>{name}</strong></div>}
            {type && <div>Type: {type}</div>}  {/* ← 추가 */}
            {typeof heightVal !== "undefined" && (
                <div>height: {heightVal}</div>
            )}
            {typeof id !== "undefined" && <div>ID: {id}</div>}
            {typeof carbon !== "undefined" && (
                <div>carbon: {carbon}</div>
            )}
            {typeof interactive !== "undefined" && (
                <div>{interactive ? "Interactive" : "Non-Interactive"}</div>
            )}
        </div>
    );
}
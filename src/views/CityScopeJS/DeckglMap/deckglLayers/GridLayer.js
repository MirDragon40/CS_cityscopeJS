// src/views/CityScopeJS/DeckglMap/deckglLayers/GridLayer.js

import { GeoJsonLayer } from "deck.gl";
import { carbonByCellId } from "../../../../carbonByCellId";
import { hexToRgb, testHex } from "../../../../utils/utils";

/**
 * Description. uses deck api to
 * collect objects in a region
 * @argument{object} e picking event
 */
export const multipleObjPicked = (e, pickingRadius, deckGLRef) => {
    const dim = pickingRadius;
    const x = e.x - dim / 2;
    const y = e.y - dim / 2;
    let multipleObj = deckGLRef.current.pickObjects({
        x: x,
        y: y,
        width: dim,
        height: dim,
    });
    return multipleObj;
};

/**
 * Description. allow only to pick cells that are
 *  not of CityScope TUI & that are interactive
 * so to not overlap TUI activity
 */
const handleGridCellEditing = (
    e,
    selectedType,
    setSelectedCellsState,
    pickingRadius,
    deckGLRef
) => {
    const { height, color, name } = selectedType;
    const multiSelectedObj = multipleObjPicked(e, pickingRadius, deckGLRef);

    multiSelectedObj.forEach((selected) => {
        const thisCellProps = selected.object.properties;
        if (thisCellProps && thisCellProps.interactive) {
            thisCellProps.color = testHex(color) ? hexToRgb(color) : color;
            thisCellProps.height = height;
            thisCellProps.name = name;
            // carbon 값은 여기서는 수정하지 않고, 데이터 주입된 값 그대로 둠
        }
    });

    setSelectedCellsState(multiSelectedObj);
};

/**
 * Description. gets `props` with geojson
 * and process the interactive area
 */
export const processGridData = (cityIOdata) => {
    const newGEOGRID = JSON.parse(JSON.stringify(cityIOdata.GEOGRID));

    for (let i = 0; i < newGEOGRID.features.length; i++) {
        const carbon = carbonByCellId?.[i] ?? 0;
        const props = newGEOGRID.features[i].properties;

        newGEOGRID.features[i].properties = {
            ...props,
            id: i,
            carbon,
            // height와 color가 없으면 기본값 추가
            height: props.height ?? 0,
            color: props.color ?? [200, 200, 200],
        };
    }

    return newGEOGRID;
};

export default function GridLayer({
    data,
    editOn,
    state: {
        selectedType,
        keyDownState,
        selectedCellsState,
        pickingRadius,
        opacity,
    },
    updaters: { setSelectedCellsState, setDraggingWhileEditing, setHoveredObj },
    deckGLRef,
}) {
    return new GeoJsonLayer({
        opacity,
        id: "GRID",
        data,
        pickable: true,
        extruded: true,
        wireframe: true,
        //!  fixed elevation for now
        elevationScale: 5,
        lineWidthScale: 1,
        lineWidthMinPixels: 2,
        getElevation: (d) => {
            const h = d.properties.height;
            return Array.isArray(h) ? h[1] : h;
        },
        getFillColor: (d) => {
            const c = d.properties.color;
            if (Array.isArray(c)) return c;
            if (typeof c === 'string') return hexToRgb(c);
            return [200, 200, 200];
        },

        onClick: (event) => {
            if (selectedType && editOn && keyDownState !== "Shift")
                handleGridCellEditing(
                    event,
                    selectedType,
                    setSelectedCellsState,
                    pickingRadius,
                    deckGLRef
                );
        },

        onDrag: (event) => {
            if (selectedType && editOn && keyDownState !== "Shift")
                handleGridCellEditing(
                    event,
                    selectedType,
                    setSelectedCellsState,
                    pickingRadius,
                    deckGLRef
                );
        },

        onDragStart: () => {
            if (selectedType && editOn && keyDownState !== "Shift") {
                setDraggingWhileEditing(true);
            }
        },

        onHover: (e) => {
            if (e.object) {
                console.log("Hovered cell:", e.object.properties);
                // 여기서 hover된 셀의 전체 정보가 DeckglMap으로 올라감
                // (DeckglMap에서 hoveredObj → layerHoveredData 로 변환)
                setHoveredObj(e);
            }
        },

        onDragEnd: () => {
            setDraggingWhileEditing(false);
        },

        updateTriggers: {
            getFillColor: selectedCellsState,
            getElevation: selectedCellsState,
        },

        transitions: {
            getFillColor: 500,
            getElevation: 150,
        },
    });
}

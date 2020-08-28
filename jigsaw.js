function save(filename, data) {
    const blob = new Blob([data], { type: "text/csv" });

    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

let seed = 1;
const MAX_JITTER = 0.13;
const random = () => { let x = Math.sin(seed) * 10000; seed += 1; return x - Math.floor(x); }
const rbool = () => { return random() > 0.5; }

const $ = (id) => { return document.getElementById(id); }
const resetValue = (id) => {
    $(id).value = $(id).dataset["default"];
    updateRange(id);
}
const updateRange = (id) => {
    $("_" + id).value = $(id).value + (id === "seed" ? "" : "%");
    if (id === "taboffset") $("randomoffset").checked = false;
    if (id === "jitter") $("randomjitter").checked = false;
    update();
}
const updateText = (id) => { let val = parseFloat($("_" + id).value); if (!isNaN(val)) { $(id).value = val; } updateRange(id); }

function genTab(x, y, props, isVertical = false) {
    const {width, height, offset, randomJitter, randomOffset, taboffset, tabSize, xn, yn} = props;
    let {jitter} = props;

    let xSize = width / xn;
    let ySize = height / yn;
    let xOffset = offset + xSize * x;
    let yOffset = offset + ySize * y;
    let result = "";
    let b, c, d, e, flip;

    const uniform = () => {
        if (randomJitter) {
            jitter = MAX_JITTER * random() * (rbool() ? 1.0 : -1.0);
        }

        return -jitter + random() * jitter * 2;
    }
    const next = () => { flip = rbool(); b = uniform(); c = uniform(); d = uniform(); e = uniform(); }
    const lValue = (value) => {
        let result = isVertical ? yOffset + value * ySize : xOffset + value * xSize;
        return Math.round(result * 100) / 100;
    }
    const wValue = (value) => {
        let reverse = flip ? -1.0 : 1.0;
        let result = isVertical ? xOffset + value * xSize * reverse : yOffset + value * ySize * reverse;
        return Math.round(result * 100) / 100;
    }

    if (x === 0 || y === 0) {
        result = "M " + xOffset + " " + yOffset + " ";
    }

    next();


    // There are 3 curves to a tab, each curve is defined by 3 points but we only need to provide 2 because the first point is the current position
    let points = [];
    let xDisplace = randomOffset ? 0.5 + ((tabSize - MAX_JITTER * 2) * random() * (rbool() ? 1.0 : -1.0)) : taboffset;

    // First curve
    points.push({ x: lValue(xDisplace + b + d), y: wValue(-tabSize + c) });
    points.push({ x: lValue(xDisplace - tabSize + b), y: wValue(tabSize + c) });
    // Second curve
    points.push({ x: lValue(xDisplace + 2.0 * tabSize + b - d), y: wValue(3.0 * tabSize + c) });
    points.push({ x: lValue(xDisplace + tabSize + b), y: wValue(tabSize + c) });
    // Third curve
    points.push({ x: lValue(0.8), y: wValue(e) });
    points.push({ x: lValue(1.0), y: wValue(0.0) });

    for (let idx = 0; idx < points.length; ++idx) {
        if (idx % 2 === 0) {
            result += "S ";
        }

        let xVal = isVertical ? points[idx].y : points[idx].x;
        let yVal = isVertical ? points[idx].x : points[idx].y;

        result += xVal + " " + yVal + " ";
    }

    return result;
}

function genD(props) {
    const {xn, yn, offset, radius, width, height} = props;
    let xi, yi, str = "", vertical = 0;

    // Draw horizontal lines
    for (yi = 1; yi < yn; ++yi) {
        xi = 0;
        for (; xi < xn; ++xi) {
            str += genTab(xi, yi, props);
        }
    }

    // Draw vertical lines
    vertical = 1;
    for (xi = 1; xi < xn; ++xi) {
        yi = 0;
        for (; yi < yn; ++yi) {
            str += genTab(xi, yi, props, true);
        }
    }

    // Draw border
    str += "M " + (offset + radius) + " " + (offset) + " ";
    str += "L " + (offset + width - radius) + " " + (offset) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset + width) + " " + (offset + radius) + " ";
    str += "L " + (offset + width) + " " + (offset + height - radius) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset + width - radius) + " " + (offset + height) + " ";
    str += "L " + (offset + radius) + " " + (offset + height) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset) + " " + (offset + height - radius) + " ";
    str += "L " + (offset) + " " + (offset + radius) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset + radius) + " " + (offset) + " ";

    return str;
}

const getProps = () => {
    const props = {};

    props.width = parseInt($("width").value);
    props.height = parseInt($("height").value);
    props.radius = parseFloat($("radius").value);
    props.jitter = parseFloat($("jitter").value) / 100.0;
    props.randomJitter = $("randomjitter").checked;
    props.randomOffset = $("randomoffset").checked;
    props.tabSize = parseFloat($("tabsize").value) / 200.0;
    props.taboffset = parseFloat($("taboffset").value) / 100.0;
    props.xn = parseInt($("xn").value);
    props.yn = parseInt($("yn").value);

    const minSize = Math.min(props.width, props.height) / 2.0;

    if (props.radius > minSize) {
        props.radius = minSize;
        $("radius").value = props.radius;
    }

    seed = parseInt($("seed").value);

    return props;
}

function update() {
    const props = getProps();
    props.offset = 5.5;

    let ratio = 1.0 * props.width / props.height;
    if (ratio > 1.5) {
        props.radius = props.radius * 900 / props.width;
        props.width = 900;
        props.height = props.width / ratio;
    }
    else {
        props.radius = props.radius * 600 / props.height;
        props.height = 600;
        props.width = props.height * ratio;
    }
    $("puzzlecontainer").setAttribute("width", props.width + 11);
    $("puzzlecontainer").setAttribute("height", props.height + 11);
    $("puzzlepath").setAttribute("d", genD(props));
}

function generate() {
    const props = getProps();
    props.offset = 0.0;

    let data = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.0\" ";
    data += "width=\"" + props.width + "mm\" height=\"" + props.height + "mm\" viewBox=\"0 0 " + props.width + " " + props.height + "\">";
    data += "<path fill=\"none\" stroke=\"black\" stroke-width=\"0.1\" d=\"";
    data += genD(props);
    data += "\"></path></svg>";

    save("jigsaw.svg", data);
}

function save(filename, data) {
    var blob = new Blob([data], { type: "text/csv" });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

var seed = 1;
const MAX_JITTER = 0.13;
const random = () => { var x = Math.sin(seed) * 10000; seed += 1; return x - Math.floor(x); }
const rbool = () => { return random() > 0.5; }

const $ = (id) => { return document.getElementById(id); }
const resetValue = (id) => {
    $(id).value = $(id).dataset["default"];
    update_range(id);
}
const update_range = (id) => {
    $("_" + id).value = $(id).value + (id === "seed" ? "" : "%");
    if (id === "taboffset") $("randomoffset").checked = false;
    if (id === "jitter") $("randomjitter").checked = false;
    update();
}
const update_text = (id) => { let val = parseFloat($("_" + id).value); if (!isNaN(val)) { $(id).value = val; } update_range(id); }

var tabSize, taboffset, tabRange, randomOffset = false, jitter, randomJitter = false, flip, xn, yn, vertical, offset, width, height, radius;

function gen_tab(x, y, isVertical = false) {
    let xSize = width / xn;
    let ySize = height / yn;
    let xOffset = offset + xSize * x;
    let yOffset = offset + ySize * y;
    let result = "";
    let b, c, d, e;

    const uniform = () => {
        if (randomJitter) {
            jitter = MAX_JITTER * random();
        }
        var r = random(); return -jitter + r * jitter * 2;
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
    var xDisplace = randomOffset ? 0.5 + (tabRange * random() * (rbool() ? 1.0 : -1.0)) : taboffset;

    // First curve
    points.push({ x: lValue(xDisplace + b + d), y: wValue(-tabSize + c) });
    points.push({ x: lValue(xDisplace - tabSize + b), y: wValue(tabSize + c) });
    // Second curve
    points.push({ x: lValue(xDisplace + 2.0 * tabSize + b - d), y: wValue(3.0 * tabSize + c) });
    points.push({ x: lValue(xDisplace + tabSize + b), y: wValue(tabSize + c) });
    // Third curve
    points.push({ x: lValue(0.8), y: wValue(e) });
    points.push({ x: lValue(1.0), y: wValue(0.0) });

    for (var idx = 0; idx < points.length; ++idx) {
        if (idx % 2 === 0) {
            result += "S ";
        }

        let xVal = isVertical ? points[idx].y : points[idx].x;
        let yVal = isVertical ? points[idx].x : points[idx].y;

        result += xVal + " " + yVal + " ";
    }
    next();
    return result;
}

function gen_d() {
    seed = parseInt($("seed").value);
    randomJitter = $("randomjitter").checked
    randomOffset = $("randomoffset").checked
    jitter = parseFloat($("jitter").value) / 100.0;
    xn = parseInt($("xn").value);
    yn = parseInt($("yn").value);
    tabSize = parseFloat($("tabsize").value) / 200.0;

    const shortSide = Math.min(width / xn, height / yn)
    tabRange = Math.floor((shortSide - ((tabSize + tabSize * MAX_JITTER) * 3)) / 200.0);
    taboffset = parseFloat($("taboffset").value) / 100.0;

    let xi, yi, str = "";

    // Draw horizontal lines
    vertical = 0;
    for (yi = 1; yi < yn; ++yi) {
        xi = 0;
        for (; xi < xn; ++xi) {
            str += gen_tab(xi, yi);
        }
    }

    // Draw vertical lines
    vertical = 1;
    for (xi = 1; xi < xn; ++xi) {
        yi = 0;
        for (; yi < yn; ++yi) {
            str += gen_tab(xi, yi, true);
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

const getRadius = () => {
    width = parseInt($("width").value);
    height = parseInt($("height").value);
    radius = parseFloat($("radius").value);

    const minSize = Math.min(width, height) / 2.0;

    if (radius > minSize) {
        radius = minSize;
        $("radius").value = radius;
    }
}

function update() {
    getRadius();
    offset = 5.5;

    var ratio = 1.0 * width / height;
    if (ratio > 1.5) {
        radius = radius * 900 / width;
        width = 900;
        height = width / ratio;
    }
    else {
        radius = radius * 600 / height;
        height = 600;
        width = height * ratio;
    }
    $("puzzlecontainer").setAttribute("width", width + 11);
    $("puzzlecontainer").setAttribute("height", height + 11);
    $("puzzlepath").setAttribute("d", gen_d());
}

function generate() {
    getRadius();
    offset = 0.0;

    var data = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.0\" ";
    data += "width=\"" + width + "mm\" height=\"" + height + "mm\" viewBox=\"0 0 " + width + " " + height + "\">";
    data += "<path fill=\"none\" stroke=\"black\" stroke-width=\"0.1\" d=\"";
    data += gen_d();
    data += "\"></path></svg>";

    save("jigsaw.svg", data);
}

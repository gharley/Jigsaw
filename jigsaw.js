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
const random = () => { var x = Math.sin(seed) * 10000; seed += 1; return x - Math.floor(x); }
const rbool = () => { return random() > 0.5; }

function $(id) { return document.getElementById(id); }
function update_range(id) { $("_" + id).value = $(id).value + (id === "seed" ? "" : "%"); update(); }
function update_text(id) { let val = parseFloat($("_" + id).value); if (!isNaN(val)) { $(id).value = val; } update_range(id); }

var a, b, c, d, e, tabSize, taboffset, jitter, flip, xi, yi, xn, yn, vertical, offset, width, height, radius;

const uniform = () => { var r = random(); return rbool() ? -jitter + r * jitter * 2 : 0.0; }
const first = () => { e = uniform(); next(); }
const next = () => { var flipold = flip; flip = rbool(); a = (flip == flipold ? -e : e); b = uniform(); c = uniform(); d = uniform(); e = uniform(); logem(); }
const logem = () => {
    console.log("b =", b, "d =", d, "e =", e);
    // console.log("a =", a, " b =", b, "c =", c, "d =", d, "e =", e);
}
function gen_tab(x, y, isVertical = false) {
    let xSize = width / xn;
    let ySize = height / yn;
    let xOffset = offset + xSize * x;
    let yOffset = offset + ySize * y;

    const lValue = (value) => {
        let result = isVertical ? yOffset + value * ySize : xOffset + value * xSize;
        return Math.round(result * 100) / 100;
    }

    const wValue = (value) => {
        let reverse = flip ? -1.0 : 1.0;
        let result = isVertical ? xOffset + value * xSize * reverse : yOffset + value * ySize * reverse;
        return Math.round(result * 100) / 100;
    }

    var result = "";

    if (x === 0 || y === 0) {
        first();
        result = "M " + xOffset + " " + yOffset + " ";
    }

    // There are 3 curves to a tab, each curve is defined by 3 points but we only need to provide 2 because the first point is the current position
    let points = [];
    var xDisplace = rbool() ? taboffset : 0.5;

    // First curve
    points.push({x: lValue(xDisplace + b + d), y: wValue(-tabSize + c)});
    points.push({x: lValue(xDisplace - tabSize + b), y: wValue(tabSize + c)});
    // Second curve
    points.push({x: lValue(xDisplace + 2.0 * tabSize + b - d), y: wValue(3.0 * tabSize + c)});
    points.push({x: lValue(xDisplace + tabSize + b), y: wValue(tabSize + c)});
    // Third curve
    points.push({x: lValue(0.8), y: wValue(e)});
    points.push({x: lValue(1.0), y: wValue(0.0)});

    for( var idx = 0; idx < points.length; ++idx){
        if(idx % 2 === 0) {
            result += "S ";
        }

        var xVal = isVertical ? points[idx].y : points[idx].x;
        var yVal = isVertical ? points[idx].x : points[idx].y;

        result += xVal + " " + yVal + " ";
    }

    return result;
}

function gen_d() {
    var str = "";

    seed = parseInt($("seed").value);
    tabSize = parseFloat($("tabsize").value) / 200.0;
    taboffset = parseFloat($("taboffset").value) / 100.0;
    jitter = parseFloat($("jitter").value) / 100.0;
    xn = parseInt($("xn").value);
    yn = parseInt($("yn").value);

    // Draw horizontal lines
    vertical = 0;
    for (yi = 1; yi < yn; ++yi) {
        xi = 0;
        for (; xi < xn; ++xi) {
            str += gen_tab(xi, yi);
            next();
        }
    }

    // Draw vertical lines
    vertical = 1;
    for (xi = 1; xi < xn; ++xi) {
        yi = 0;
        for (; yi < yn; ++yi) {
            str += gen_tab(xi, yi, true);
            next();
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

    if(radius > minSize){
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

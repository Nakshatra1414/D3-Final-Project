console.log("Trying to load CSV...");

// --------------------------
// LOAD DATA
// --------------------------
d3.csv("data/online_shoppers_d3.csv").then(data => {
    console.log("CSV loaded!", data.slice(0, 5));

    // Convert & clean data
    data.forEach(d => {
        d.ProductRelated = +d.ProductRelated;
        d.PageValues = +d.PageValues;
        d.BounceRates = +d.BounceRates;
        d.ExitRates = +d.ExitRates;
        d.TrafficType = +d.TrafficType;

        d.Month = String(d.Month).trim();
        d.VisitorType = String(d.VisitorType).trim();
        d.Weekend = String(d.Weekend);
        d.Revenue = String(d.Revenue);
    });

    initMonthFilter(data);
    initVisitorFilter(data);
    initWeekendFilter(data);
    drawScatterplot(data);
    drawSankey(data);

}).catch(error => {
    console.error("CSV load error:", error);
});

// --------------------------
// SCATTERPLOT
// --------------------------
function drawScatterplot(data) {
    const svg = d3.select("#scatterplot");
    svg.selectAll("*").remove();

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.ProductRelated)])
        .nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PageValues)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(["True", "False"])
        .range(["#2ca02c", "#d62728"]);

    // Points
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.ProductRelated))
        .attr("cy", d => y(d.PageValues))
        .attr("r", 4)
        .attr("fill", d => color(d.Revenue))
        .attr("opacity", 0.7);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width/2)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("Product-Related Pages Viewed");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -45)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("Page Value");
}

// --------------------------
// SANKEY DIAGRAM
// --------------------------
function drawSankey(data) {
    const svg = d3.select("#sankey");
    svg.selectAll("*").remove();

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(12)
        .extent([[1, 1], [width - 1, height - 6]]);

    const nodeMap = new Map();
    const linkMap = new Map();
    const nodes = [];

    function getNode(name) {
        if (!nodeMap.has(name)) {
            nodeMap.set(name, nodes.length);
            nodes.push({ name });
        }
        return nodeMap.get(name);
    }

    data.forEach(d => {
        const path = [
            d.VisitorType,
            d.Month,
            d.Weekend === "True" ? "Weekend" : "Weekday",
            d.Revenue === "True" ? "Revenue" : "No Revenue"
        ];
        for (let i = 0; i < path.length - 1; i++) {
            const source = getNode(path[i]);
            const target = getNode(path[i + 1]);
            const key = `${source}-${target}`;
            linkMap.set(key, (linkMap.get(key) || 0) + 1);
        }
    });

    const links = Array.from(linkMap, ([key, value]) => {
        const [source, target] = key.split("-").map(Number);
        return { source, target, value };
    });

    const graph = sankey({
        nodes: nodes.map(d => ({ ...d })),
        links: links.map(d => ({ ...d }))
    });

    // Draw links
    svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("fill", "none")
        .attr("opacity", 0.5);

    // Draw nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g");

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "#4682b4");

    node.append("text")
        .attr("x", d => d.x0 - 6)
        .attr("y", d => (d.y0 + d.y1)/2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name)
        .filter(d => d.x0 < width/2)
        .attr("x", d => d.x1 + 6)
        .attr("text-anchor", "start");
}

// --------------------------
// FILTERS
// --------------------------
function initMonthFilter(data) {
    const select = d3.select("#month-filter");
    select.selectAll("*").remove();

    const months = ["All", ...Array.from(new Set(data.map(d => d.Month)))];
    select.selectAll("option")
        .data(months)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    select.on("change", applyFilters);
}

function initVisitorFilter(data) {
    const select = d3.select("#visitor-filter");
    select.selectAll("*").remove();

    const types = ["All", ...Array.from(new Set(data.map(d => d.VisitorType)))];
    select.selectAll("option")
        .data(types)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    select.on("change", applyFilters);
}

function initWeekendFilter(data) {
    const select = d3.select("#weekend-filter");
    select.selectAll("*").remove();

    const options = ["All", "Weekend", "Weekday"];
    select.selectAll("option")
        .data(options)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    select.on("change", applyFilters);
}

// Apply all filters
function applyFilters() {
    d3.csv("../data/processed/online_shoppers_d3.csv").then(data => {
        data.forEach(d => {
            d.ProductRelated = +d.ProductRelated;
            d.PageValues = +d.PageValues;
            d.BounceRates = +d.BounceRates;
            d.ExitRates = +d.ExitRates;
            d.TrafficType = +d.TrafficType;
            d.Month = String(d.Month).trim();
            d.VisitorType = String(d.VisitorType).trim();
            d.Weekend = String(d.Weekend);
            d.Revenue = String(d.Revenue);
        });

        const month = d3.select("#month-filter").property("value");
        const visitor = d3.select("#visitor-filter").property("value");
        const weekend = d3.select("#weekend-filter").property("value");

        const filtered = data.filter(d =>
            (month === "All" || d.Month === month) &&
            (visitor === "All" || d.VisitorType === visitor) &&
            (weekend === "All" || (d.Weekend === "True" ? "Weekend" : "Weekday") === weekend)
        );

        drawScatterplot(filtered);
        drawSankey(filtered);
    });
}

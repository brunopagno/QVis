/////////////////////////////////////////////////
// Clock
/////////////////////////////////////////////////

var week_day = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

function Clock() {
    this._arcs = [
        new SunArc(this),
        new LuminosityArc(this),
        new ActivityArc(this),
    ];
    this._size = 300;
    this._margin = 5;
    this._data = [];
    this._tooltip = "";
    this._element = "";
    this._elid = "";
    this._innerRadius = 0;
    this._slice_info = "";
}

Clock.prototype.preprocess = function (data) {
    if (data.size) this._size = data.size;
    if (data.margin) this._margin = data.margin;

    this._elid = data.date.substr(0, 10);
    data.date = new Date(data.date);

    this._radius = this._size / 2 - this._margin;
}

Clock.prototype.validate = function (data) {
    for (var i = 0; i < this._arcs.length; i++) {
        this._arcs[i].validate(data);
    };

    return true;
}

Clock.prototype.draw = function (element, data) {
    if (!this.validate(data)) {
        console.log("There was an error in the data provided to the clock");
        return;
    }

    this.preprocess(data);

    this._data = data;

    this._element = d3.select(element).append("div")
        .attr("class", "clock")
        .attr("id", this._elid);

    this._tooltip = this._element.append("div")
        .attr("class", "clock-tooltip")
        .style("opacity", 0);

    this._slice_info = this._element.append("div")
        .attr("class", "slice-info")
        .style("visibility", "hidden");

    var svg = this._element.append("svg")
        .attr("class", "clock-arcs")
        .attr("width", this._size)
        .attr("height", this._size);

    var outerRadius = this._radius;
    var walkedRadius = 0;
    for (var i = 0; i < this._arcs.length; i++) {
        var arc = this._arcs[i];
        if (!arc._active) {
            continue;
        }
        var innerRadius = this._radius * (1 - arc._width) - walkedRadius;
        arc.draw(svg, data, outerRadius, innerRadius)
        outerRadius = innerRadius;
        walkedRadius += this._radius - innerRadius;
    };
    this._innerRadius = outerRadius;

    if (data.weather) {
        this.drawWeather(svg);
    }
    new TextArc(this).draw(svg, data.date);
}

Clock.prototype.drawWeather = function (svg) {
    var weather_size = 32;
    var icon = "/images/sun.png";
    if (this._data.weather && this._data.weather.events) {
        if (this._data.weather.events.indexOf("Rain") >= 0) {
            icon = "/images/rain.png";
        } else if (this._data.weather.events.indexOf("Thunderstorm") >= 0) {
            icon = "/images/thunder.png";
        } else if (this._data.weather.events.indexOf("Fog") >= 0) {
            icon = "/images/fog.png";
        }
    }

    svg.append("svg:image")
        .attr("class", "clock-weather-image")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (this._size / 2 - weather_size * 2.2) + "," + (this._size / 1.8 - weather_size / 2) + ")")
        .attr("x", "0")
        .attr("y", "0")
        .attr("height", weather_size)
        .attr("width", weather_size)
        .attr("xlink:href", icon);

    svg.append("svg:text")
        .attr("class", "clock-weather-max")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + this._size / 2 + "," + this._size / 1.8 + ")")
        .text("max: " + this._data.weather.high + "°C");
    svg.append("svg:text")
        .attr("class", "clock-weather-min")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + this._size / 2 + "," + this._size / 1.6 + ")")
        .text("min: " + this._data.weather.low + "°C");
}

Clock.prototype.arcMouseOn = function (text) {
    this._tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    this._tooltip.text(text);
}

Clock.prototype.arcMouseOut = function () {
    this._tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

/////////////////////////////////////////////////
// Sun Arc
/////////////////////////////////////////////////

function SunArc(clock) {
    this._clock = clock;
    this._active = true;
    this._width = 0.08;
    this._pie = d3.layout.pie()
        .sort(null)
        .value(function (d) { return 1; });
}

SunArc.prototype.validate = function (data) {
    if (!data.sun.sunrise || !data.sun.sunset) {
        this._active = false;
    } else {
        if (!(data.sun.sunrise instanceof Date)) data.sun.sunrise = new Date(data.sun.sunrise);
        if (!(data.sun.sunset instanceof Date)) data.sun.sunset = new Date(data.sun.sunset);
    }
    return this._active;
}

SunArc.prototype.draw = function (svg, data, outerRadius, innerRadius) {
    var sun_scale = d3.scale.linear().domain([0, 24]).range([0, 360]);

    var sunSvg = svg.append("g")
        .attr("class", "sun-arc")
        .attr("transform", "translate(" + this._clock._size / 2 + "," + this._clock._size / 2 + ")");

    var dayStartAngle = sun_scale(data.sun.sunrise.getHours() + data.sun.sunrise.getMinutes() / 60) * Math.PI / 180;
    var dayEndAngle = sun_scale(data.sun.sunset.getHours() + data.sun.sunset.getMinutes() / 60) * Math.PI / 180;

    var sunArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var clock = this._clock;
    var dayPath = sunSvg.append("path")
        .attr("class", "sun-outline-arc")
        .attr("fill", "#7ec7ee")
        .attr("d", sunArc.startAngle(function (d) {
            return dayStartAngle;
        }).endAngle(function (d) {
            return dayEndAngle;
        }))
        .on("mouseover", function (d) { clock.arcMouseOn('Day'); })
        .on("mouseout", function (d) { clock.arcMouseOut(); });

    var nightPath = sunSvg.append("path")
        .attr("class", "sun-outline-arc")
        .attr("fill", "#5c5c83")
        .attr("d", sunArc.startAngle(function (d) {
            return dayEndAngle;
        }).endAngle(function (d) {
            return dayStartAngle + Math.PI * 2;
        }))
        .on("mouseover", function (d) { clock.arcMouseOn('Night'); })
        .on("mouseout", function (d) { clock.arcMouseOut(); });

    var alpha = (dayStartAngle + dayEndAngle) / 2;
    var r = (outerRadius + innerRadius) / 2;
    var sunSize = outerRadius * 0.03;

    var sunCircleSvg = sunSvg.append("circle")
        .attr("fill", "yellow")
        .attr("cx", r * Math.sin(alpha))
        .attr("cy", -r * Math.cos(alpha))
        .attr("r", sunSize);

    var moonCircleSvg = sunSvg.append("circle")
        .attr("fill", "lightgray")
        .attr("cx", -r * Math.sin(alpha))
        .attr("cy", r * Math.cos(alpha))
        .attr("r", sunSize);
}

/////////////////////////////////////////////////
// Luminosity Arc
/////////////////////////////////////////////////

function LuminosityArc(clock) {
    this._clock = clock;
    this._active = true;
    this._width = 0.08;
}

LuminosityArc.prototype.validate = function (data) {
    if (!data.luminosity) {
        this._active = false;
    }
    return this._active;
}

LuminosityArc.prototype.draw = function (svg, data, outerRadius, innerRadius) {
    var max_luminosity = d3.max(data.luminosity);
    var luminosity_scale = d3.scale.linear().domain([0, max_luminosity / 2, max_luminosity]).range(["#999900", "#cccc00", "#ffff66"]);

    var innerPie = d3.layout.pie()
        .sort(null)
        .padAngle(-0.01)
        .value(function (d) { return 1; });

    var luminositySvg = svg.append("g")
        .attr("class", "luminosity-arc")
        .attr("transform", "translate(" + this._clock._size / 2 + "," + this._clock._size / 2 + ")");

    var luminosityArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var clock = this._clock;
    var luminosityOuterPath = luminositySvg.selectAll(".luminosity-outline-arc")
        .data(innerPie(data.luminosity))
        .enter().append("path")
        .attr("class", "luminosity-outline-arc")
        .attr("fill", function (d) { return luminosity_scale(d.data); })
        .attr("d", luminosityArc)
        .on("mouseover", function (d) { clock.arcMouseOn("Luminosity " + d.data); })
        .on("mouseout", function (d) { clock.arcMouseOut(); });
}

/////////////////////////////////////////////////
// Activity Arc
/////////////////////////////////////////////////

function ActivityArc(clock) {
    this._clock = clock;
    this._active = true;
    this._width = 0.3;
    this._has_appointments = false;
}

ActivityArc.prototype.validate = function (data) {
    if (!data.activities) {
        this._active = false;
    }
    if (data.appointments) {
        this._has_appointments = true;
    }
    return this._active;
}

ActivityArc.prototype.draw = function (svg, data, outerRadius, innerRadius) {
    var max_activity = d3.max(data.activities, function (d) { return d.activity; });
    if ($('.clocks-relative-to-all').is(":checked")) {
        max_activity = max_selected_activity;
    }
    var activity_scale = d3.scale.linear().domain([0, max_activity]).range([0, 100]);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) { return 1; });

    var activityArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(function (d) {
            if (d.data.activity == "sleep") {
                return (outerRadius - innerRadius) * (activity_scale(max_activity) / 100.0) + innerRadius;
            } else {
                var value = (d.data.activity < (max_activity * 0.05) && d.data.activity != 0) ? (max_activity * 0.05) : d.data.activity
                return (outerRadius - innerRadius) * (activity_scale(value) / 100.0) + innerRadius;
            }
        });

    var activityOutlineArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var activitySvg = svg.append("g")
        .attr("class", "activity-arc")
        .attr("transform", "translate(" + this._clock._size / 2 + "," + this._clock._size / 2 + ")");

    var path = activitySvg.selectAll(".solid-arc")
        .data(pie(data.activities))
        .enter().append("path")
        .attr("class", "solid-arc")
        .attr("d", activityArc);

    var clock = this._clock;
    var outerPath = activitySvg.selectAll(".outline-arc")
        .data(pie(data.activities))
        .enter().append("path")
        .attr("class", "outline-arc interaction-path")
        .attr("d", activityOutlineArc)
        .attr("stroke-width", function (d) { return d.data.ev ? '4px' : '2px' })
        .attr("stroke", function (d) { return d.data.ev ? '#444' : 'black' })
        .on("mouseover", function (d) { clock.arcMouseOn("Activity " + d.data.activity); })
        .on("mouseout", function (d) { clock.arcMouseOut(); })
        .on("mousedown", function (d, i) { clock.arcMouseClick(this, i + 1); });
}

/////////////////////////////////////////////////
// Text Arc
/////////////////////////////////////////////////

function TextArc(clock) {
    this._clock = clock;
    this._active = true;
}

TextArc.prototype.draw = function (svg, date) {
    var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    var textSvg = svg.append("g")
        .attr("class", "text-arc")
        .attr("transform", "translate(" + this._clock._size / 2 + "," + this._clock._size / 2 + ")");

    var degrees = 15 * Math.PI / 180;
    var textOffset = this._clock._size / 35;
    var radiusPercent = this._clock._radius * 0.75;
    var textLayer = textSvg.selectAll(".clock-label")
        .data(hours)
        .enter().append("text")
        .attr("class", "clock-label")
        .attr("x", function (d) {
            return radiusPercent * Math.cos((degrees * d) + (degrees / 2) - 1.5708) - textOffset;
        })
        .attr("y", function (d) {
            return radiusPercent * Math.sin((degrees * d) + (degrees / 2) - 1.5708) + textOffset;
        })
        .text(function (d) {
            return d;
        });

    svg.append("svg:text")
        .attr("class", "clock-date")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + this._clock._size / 2 + "," + this._clock._size / 2.3 + ")")
        .text(date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear());
}

function fillCalendar(element, data) {
    var max_activity = d3.max(data, function (d) { return d.activity });
    var steps_color = d3.scaleLinear().domain([0, max_activity / 2, max_activity]).range(["#ff1a1a", "#ffff1a", "#1aff1a"]);

    var max_work = d3.max(data, function (d) { return d.work });
    var work_color = d3.scaleLinear().domain([0, max_work / 2, max_work]).range(["#bbbbbb", "#6699ff"]);

    evs = [];
    data.forEach(function (d, i) {
        evs.push({
            d: d,
            title: d.activity + " activity",
            start: d.date,
            allDay: true,
            color: steps_color(d.activity),
            textColor: 'black',
            order: 1,
            weather: d.weather
        });
    });

    $(element).fullCalendar({
        header: {
            left: 'prev,next',
            center: 'title',
            right: 'month'
        },
        defaultDate: data[data.length - 1].date,
        displayEventTime: false,
        businessHours: false,
        editable: false,
        events: evs,
        eventOrder: 'order',
        eventRender: function (ev, el) {
            el.addClass("day-item");
            el.css('height', '5px');
            el.css('padding', '6px 12px 14px 12px');
            el.css('font-weight', 'bold');

            var tooltip = ev.weather.events;
            if (!tooltip) tooltip = "Sunny";
            var weather = $("<div title=\"" + tooltip + "\">");
            if (!ev.weather.events) { weather.attr("class", "cal-weather sun"); }
            else if (ev.weather.events.indexOf("Rain") >= 0) { weather.attr("class", "cal-weather rain"); }
            else if (ev.weather.events.indexOf("Thunderstorm") >= 0) { weather.attr("class", "cal-weather thunder"); }
            else if (ev.weather.events.indexOf("Fog") >= 0) { weather.attr("class", "cal-weather fog"); }

            var holder = $("<div>").attr("class", "ev-cal-holder");
            holder.append(weather);
            holder.append(el);
            return holder;
        }
    });
}

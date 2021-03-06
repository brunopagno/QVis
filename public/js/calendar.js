calendarSelectedDays = [];

function fillCalendar(element, data) {
    var max_activity = d3.max(data, function (d) { return d.activity });
    var steps_color = d3.scale.linear().domain([0, max_activity / 2, max_activity]).range(["#ff1a1a", "#ffff1a", "#1aff1a"]);

    var max_work = d3.max(data, function (d) { return d.work });
    var work_color = d3.scale.linear().domain([0, max_work / 2, max_work]).range(["#bbbbbb", "#6699ff"]);

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

            var checkbox = $('<input type=checkbox class="calendar-box">')
            checkbox.attr("dayid", dayid);
            checkbox.attr("value", ev.start);
            checkbox.prop("checked", calendarSelectedDays.indexOf(dayid) >= 0 || $('.calendar-select-all').prop('checked'));

            // CHECK CALENDAR DAY
            checkbox.change(function() {
                var dd = ev.d.formattedDate.substr(0, 10);
                if (this.checked) {
                    calendarSelectedDays.push(dd);
                    $("#" + dd).css("display", "block");
                } else {
                    var index = calendarSelectedDays.indexOf(ev.dayid);
                    if (index > -1) {
                        calendarSelectedDays.splice(index, 1);
                    }
                    $("#" + dd).css("display", "none");
                }
            });

            var tooltip = ev.weather.events;
            if (!tooltip) tooltip = "Sunny";
            var weather = $("<div title=\"" + tooltip + "\">");
            if (!ev.weather.events) { weather.attr("class", "cal-weather sun"); }
            else if (ev.weather.events.indexOf("Rain") >= 0) { weather.attr("class", "cal-weather rain"); }
            else if (ev.weather.events.indexOf("Thunderstorm") >= 0) { weather.attr("class", "cal-weather thunder"); }
            else if (ev.weather.events.indexOf("Fog") >= 0) { weather.attr("class", "cal-weather fog"); }

            var dayid = ev.d.date.substr(0, 10);
            var fullHistogram = el;
            fullHistogram.on("mousedown", function () {
                var histo = d3.select(element).append("div").attr("class", "full-histogram");

                histo.append("div")
                    .attr("class", "close-histo float-right")
                    .append("a")
                    .attr("class", "button round alert tiny")
                    .text("X")
                    .on("mousedown", function () {
                        histo.remove();
                    });

                histo.append("h3").text(dayid);
                var user_id = $("#current-person").data("id");
                var dd = new Date(ev.d.date);

                var url = "/person/" + user_id + "/histogram/" + dd.getFullYear() + "/" + (dd.getMonth() + 1) + "/" + dd.getDate();
                $.ajax({
                    url: url,
                    success: function (data) {
                        var xaxis = ['x'];
                        var yaxis = ['activities'];
                        data.forEach(function (d) {
                            xaxis.push(new Date(d.datetime));
                            yaxis.push(+d.activity);
                        });

                        var chart = c3.generate({
                            bindto: histo.append("div"),
                            size: {
                                height: 220
                            },
                            data: {
                                x: 'x',
                                columns: [xaxis, yaxis],
                                type: 'bar'
                            },
                            axis: {
                                x: {
                                    type: 'timeseries',
                                    tick: {
                                        format: '%H:%M'
                                    }
                                }
                            }
                        });
                    },
                    error: function () {
                        console.log("error loading histogram data");
                    }
                });
            });

            var holder = $("<div>").attr("class", "ev-cal-holder");
            holder.append(checkbox);
            holder.append(weather);
            holder.append(el);
            return holder;
        }
    });
}

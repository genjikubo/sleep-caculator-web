var SCBedTime = {
    hours: 0,
    minutes: 0,
    meridiem: "AM"
};
(function() {
    new IosSelector({
        el: '.time-picker__hours',
        type: 'infinite',
        source: createArray(12, 1),
        count: 16,
        value: 6,
        sensitivity: 3,
        onAnimationStart: function(selected) {
            SCBedTime.hours = selected.value;
        },
        onChange: function(selected) {
            SCBedTime.hours = selected.value;
        }
    });
    new IosSelector({
        el: '.time-picker__minutes',
        type: 'infinite',
        source: createArray(60, 0, true),
        count: 16,
        value: 30,
        sensitivity: 3,
        onAnimationStart: function(selected) {
            SCBedTime.minutes = selected.value;
        },
        onChange: function(selected) {
            SCBedTime.minutes = selected.value;
        }
    });
    new IosSelector({
        el: '.time-picker__meridiem',
        type: 'normal',
        source: [{
            value: "AM",
            text: "AM"
        }, {
            value: "PM",
            text: "PM"
        }],
        count: 16,
        value: "AM",
        sensitivity: 3,
        wheelSensitivity: 0.05,
        onChange: function(selected) {
            SCBedTime.meridiem = selected.value;
        }
    });

    function createArray(num, addValue, format) {
        var res = [],
            value = 0,
            text = "";
        addValue = addValue || 0;
        for (var i = 0; i < num; i++) {
            value = i + addValue;
            text = (format && value < 10) ? "0" + value : value;
            res.push({
                value: value,
                text: text
            });
        }
        return res;
    }
})();
(function() {
    var timeElem = document.querySelector("#timeElem"),
        calcElem = document.querySelector("#calcElem"),
        hiddenCls = "content-section_hidden";
    preventCls = "content-section_prevent";
    addEventListener("#calcBedTime", function() {
        fill("bedtime");
        showElem(calcElem, timeElem);
    });
    addEventListener("#calcWakeTime", function() {
        fill("wakeup");
        showElem(calcElem, timeElem);
    });
    addEventListener("#backButton", function() {
        showElem(timeElem, calcElem);
    });

    function addEventListener(id, fn) {
        var elem = document.querySelector(id),
            _moved = false;
        elem.addEventListener("touchstart", listener);
        elem.addEventListener("click", listener);

        function listener(event) {
            if (event.cancelable && event.type != "touchstart") {
                prevent(event);
            }
            if (event.type == "touchstart") {
                _moved = false;
                elem.addEventListener("touchend", listener);
                document.addEventListener("touchmove", touchmove);
                return;
            }
            if (event.type == "touchend") {
                (_moved ? prevent : fn).bind(this)(event);
                elem.removeEventListener("touchend", listener);
                document.removeEventListener("touchmove", touchmove);
            } else {
                fn.bind(this)(event);
            }
        }

        function prevent(event) {
            event.preventDefault();
        }

        function touchmove() {
            _moved = true;
        }
    }

    function showElem(elem, hideElem) {
        elem.addEventListener("transitionend", transitionEnd);
        hideElem.classList.add(hiddenCls);
        hideElem.classList.add(preventCls);
        elem.classList.add(preventCls);
        elem.classList.remove(hiddenCls);

        function transitionEnd(event) {
            if (event.target != elem && event.propertyName != "opacity") {
                return;
            }
            elem.classList.remove(preventCls);
            elem.removeEventListener("transitionEnd", transitionEnd);
        }
    }

    function fill(type) {
        var titleElem = document.querySelector("#titleElem"),
            timeSpan = document.querySelector("#timeSpan"),
            bedText = document.querySelector("#bedTextElem"),
            wakeText = document.querySelector("#wakeTextElem"),
            textHiddenCls = "time-view__text_hidden";
        if (type == "bedtime") {
            titleElem.innerHTML = titleElem.dataset.titleBed;
            timeSpan.innerHTML = formatTime(SCBedTime);
            bedText.classList.remove(textHiddenCls);
            wakeText.classList.add(textHiddenCls);
        } else {
            titleElem.innerHTML = titleElem.dataset.titleWakeup;
            bedText.classList.add(textHiddenCls);
            wakeText.classList.remove(textHiddenCls);
        }
        fillList(type);
    }

    function fillList(type) {
        var timeList = document.querySelector("#timeList"),
            template = '<li class="time-list__item{{cls}}"><span class="time-list__text">{{time}}</span></li>',
            suggestedClass = "time-list__item_suggested",
            curItem = "";
        timeList.innerHTML = "";
        for (var i = 0; i < 6; i++) {
            curItem = template;
            curItem = curItem.replace("{{cls}}", i < 2 ? " " + suggestedClass : "");
            if (type == "bedtime") {
                curItem = curItem.replace("{{time}}", formatTime(SCBedTime, (6 - i) * -1.5 - .25));
            } else {
                curItem = curItem.replace("{{time}}", formatTime(getTime(), (6 - i) * 1.5 + .25));
            }
            timeList.innerHTML += curItem;
        }
    }

    function formatTime(time, addHours) {
        var allMinutes = time.hours * 60 + time.minutes,
            str = "",
            hours = 0,
            minutes = 0,
            meridiem = time.meridiem;
        allMinutes += addHours ? addHours * 60 : 0;
        if (allMinutes < 0) {
            allMinutes = 720 + allMinutes;
            meridiem = meridiem == "AM" ? "PM" : "AM";
        } else if (allMinutes > 720) {
            allMinutes -= 720;
            meridiem = meridiem == "AM" ? "PM" : "AM";
        }
        hours = parseInt(allMinutes / 60);
        hours = !hours ? 12 : hours;
        minutes = allMinutes % 60;
        minutes = minutes >= 10 ? minutes : "0" + minutes;
        str = hours + ":" + minutes + "&nbsp;" + meridiem;
        return str;
    }

    function getTime() {
        var time = new Date(),
            hours = time.getHours(),
            minutes = time.getMinutes(),
            meridiem = "AM";
        if (hours > 11) {
            hours -= 12;
            meridiem = "PM";
        }
        return {
            hours: hours,
            minutes: minutes,
            meridiem: meridiem,
        }
    }
})();
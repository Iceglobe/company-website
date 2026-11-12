// OmniaOps call booking. Every slot is open, so a booking is confirmed on the spot:
// the visitor gets a calendar file and the request is emailed to Philip via Web3Forms.
//
// TO CHANGE AVAILABILITY: edit SLOTS (Copenhagen time, 24h) and CALL_MINUTES below.
(function () {
    var form = document.getElementById('booking');
    if (!form) return;

    var HOME_TZ = 'Europe/Copenhagen';
    var SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    var CALL_MINUTES = 30;
    var DAYS_PER_PAGE = 10;
    var MAX_PAGES = 4;
    var ENDPOINT = 'https://api.web3forms.com/submit';
    var HOST_EMAIL = 'phlv@omniaops.com';

    var daysEl = form.querySelector('#bk-days');
    var timesEl = form.querySelector('#bk-times');
    var tzEl = form.querySelector('#bk-tz');
    var moreEl = form.querySelector('#bk-more');
    var summaryEl = form.querySelector('#bk-summary');
    var errorEl = form.querySelector('#bk-error');
    var submitEl = form.querySelector('button[type="submit"]');
    var fieldsEl = form.querySelector('#bk-fields');
    var doneEl = form.querySelector('#bk-done');

    var visitorTz;
    try { visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || HOME_TZ; } catch (e) { visitorTz = HOME_TZ; }

    var state = { day: null, time: null, page: 1 };

    function pad(n) { return String(n).padStart(2, '0'); }

    // Wall-clock parts of a UTC instant in a given time zone
    function partsIn(tz, date) {
        var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        var o = {};
        f.formatToParts(date).forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
        return o;
    }
    // UTC instant for a wall-clock time in Copenhagen
    function homeToDate(y, m, d, hh, mm) {
        var guess = Date.UTC(y, m - 1, d, hh, mm);
        var p = partsIn(HOME_TZ, new Date(guess));
        var asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
        return new Date(guess - (asUtc - guess));
    }
    function fmt(date, opts) {
        opts.timeZone = visitorTz;
        return new Intl.DateTimeFormat('en-GB', opts).format(date);
    }

    // Next working days in Copenhagen, starting tomorrow
    function workingDays(count) {
        var now = partsIn(HOME_TZ, new Date());
        var cursor = new Date(Date.UTC(now.year, now.month - 1, now.day));
        var out = [];
        while (out.length < count) {
            cursor.setUTCDate(cursor.getUTCDate() + 1);
            var dow = cursor.getUTCDay();
            if (dow === 0 || dow === 6) continue;
            out.push({ y: cursor.getUTCFullYear(), m: cursor.getUTCMonth() + 1, d: cursor.getUTCDate() });
        }
        return out;
    }
    function key(day) { return day.y + '-' + pad(day.m) + '-' + pad(day.d); }
    function slotDate(day, slot) {
        var hm = slot.split(':');
        return homeToDate(day.y, day.m, day.d, parseInt(hm[0], 10), parseInt(hm[1], 10));
    }

    function renderDays() {
        var days = workingDays(DAYS_PER_PAGE * state.page);
        daysEl.innerHTML = '';
        days.forEach(function (day) {
            var noon = homeToDate(day.y, day.m, day.d, 12, 0);
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'bk-day';
            b.setAttribute('role', 'radio');
            var on = state.day && key(state.day) === key(day);
            b.setAttribute('aria-checked', on ? 'true' : 'false');
            b.setAttribute('aria-label', new Intl.DateTimeFormat('en-GB', { timeZone: HOME_TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(noon));
            b.innerHTML = '<span class="dow">' + new Intl.DateTimeFormat('en-GB', { timeZone: HOME_TZ, weekday: 'short' }).format(noon) + '</span>' +
                '<span class="dom">' + day.d + '</span>' +
                '<span class="mon">' + new Intl.DateTimeFormat('en-GB', { timeZone: HOME_TZ, month: 'short' }).format(noon) + '</span>';
            b.addEventListener('click', function () { state.day = day; state.time = null; renderDays(); renderTimes(); renderSummary(); });
            daysEl.appendChild(b);
        });
        if (moreEl) moreEl.hidden = state.page >= MAX_PAGES;
    }

    function renderTimes() {
        timesEl.innerHTML = '';
        if (!state.day) return;
        SLOTS.forEach(function (slot) {
            var when = slotDate(state.day, slot);
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'bk-time';
            b.setAttribute('role', 'radio');
            b.setAttribute('aria-checked', state.time === slot ? 'true' : 'false');
            b.textContent = fmt(when, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
            b.addEventListener('click', function () {
                state.time = slot;
                renderTimes();
                renderSummary();
                clearError();
                var first = form.querySelector('#bk-name');
                if (first && !first.value && window.matchMedia('(min-width: 721px)').matches) first.focus({ preventScroll: true });
            });
            timesEl.appendChild(b);
        });
    }

    function whenText(start) {
        var end = new Date(start.getTime() + CALL_MINUTES * 60000);
        return fmt(start, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' +
            fmt(start, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) + '\u2013' +
            fmt(end, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    }

    function renderSummary() {
        if (state.day && state.time) {
            summaryEl.innerHTML = 'Your call: <strong>' + whenText(slotDate(state.day, state.time)) + '</strong>';
            summaryEl.hidden = false;
        } else {
            summaryEl.hidden = true;
        }
    }

    function showError(msg) { errorEl.innerHTML = msg; errorEl.classList.add('show'); }
    function clearError() { errorEl.classList.remove('show'); }

    function validate() {
        var ok = true;
        [['bk-name', function (v) { return v.length >= 2; }],
         ['bk-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }],
         ['bk-company', function (v) { return v.length >= 1; }]].forEach(function (pair) {
            var input = form.querySelector('#' + pair[0]);
            var good = pair[1](input.value.trim());
            input.closest('.field').classList.toggle('has-error', !good);
            input.setAttribute('aria-invalid', good ? 'false' : 'true');
            if (!good && ok) { input.focus(); }
            ok = ok && good;
        });
        return ok;
    }
    form.querySelectorAll('.field input').forEach(function (input) {
        input.addEventListener('input', function () { input.closest('.field').classList.remove('has-error'); });
    });

    function icsStamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    function buildIcs(start, end, name) {
        var desc = '30-minute call with Philip Valentin, founder of OmniaOps. Philip sends the video link by email before the call.\n\nNeed to move it? phlv@omniaops.com or +45 22 40 52 92.';
        return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//OmniaOps//Call booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
            'UID:' + icsStamp(start) + '-' + Math.random().toString(36).slice(2, 10) + '@omniaops.com',
            'DTSTAMP:' + icsStamp(new Date()), 'DTSTART:' + icsStamp(start), 'DTEND:' + icsStamp(end),
            'SUMMARY:' + icsEscape('OmniaOps planning review: ' + name + ' and Philip Valentin'),
            'DESCRIPTION:' + icsEscape(desc), 'LOCATION:Video call (link by email)',
            'ORGANIZER;CN=Philip Valentin:mailto:' + HOST_EMAIL, 'STATUS:CONFIRMED',
            'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:OmniaOps call in 15 minutes', 'END:VALARM',
            'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    }

    function showDone(start, end, name, email) {
        var title = 'OmniaOps planning review with Philip Valentin';
        var details = '30-minute call with Philip Valentin, founder of OmniaOps. Philip sends the video link by email before the call.';
        doneEl.querySelector('#bk-done-when').textContent = whenText(start);
        doneEl.querySelector('#bk-done-tz').textContent = 'Your time (' + visitorTz.replace(/_/g, ' ') + ')';
        doneEl.querySelector('#bk-done-email').textContent = email;
        var blob = new Blob([buildIcs(start, end, name)], { type: 'text/calendar;charset=utf-8' });
        var ics = doneEl.querySelector('#bk-ics');
        ics.href = URL.createObjectURL(blob);
        ics.download = 'omniaops-call.ics';
        doneEl.querySelector('#bk-gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
            '&dates=' + icsStamp(start) + '/' + icsStamp(end) + '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent('Video call (link by email)');
        doneEl.querySelector('#bk-outlook').href = 'https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=' + encodeURIComponent(title) +
            '&startdt=' + encodeURIComponent(start.toISOString()) + '&enddt=' + encodeURIComponent(end.toISOString()) + '&body=' + encodeURIComponent(details);
        fieldsEl.hidden = true;
        doneEl.hidden = false;
        doneEl.setAttribute('tabindex', '-1');
        doneEl.focus({ preventScroll: true });
        var top = form.getBoundingClientRect().top + window.scrollY - 96;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearError();
        if (!state.day || !state.time) {
            showError('Pick a day and a time first.');
            daysEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!validate()) return;
        if (form.querySelector('[name="botcheck"]').checked) return;

        var name = form.querySelector('#bk-name').value.trim();
        var email = form.querySelector('#bk-email').value.trim();
        var company = form.querySelector('#bk-company').value.trim();
        var message = form.querySelector('#bk-message').value.trim();
        var start = slotDate(state.day, state.time);
        var end = new Date(start.getTime() + CALL_MINUTES * 60000);
        var params = new URLSearchParams(window.location.search);
        var utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map(function (k) { return params.get(k) || ''; });
        var cphWhen = key(state.day) + ' ' + state.time + ' Copenhagen time';

        var payload = {
            access_key: form.querySelector('[name="access_key"]').value,
            subject: 'Call booked: ' + name + (company ? ' (' + company + ')' : '') + ', ' + cphWhen,
            from_name: name,
            email: email,
            message: [
                'CONFIRMED CALL (the visitor was told it is booked)',
                '',
                'When:     ' + cphWhen + ' (' + CALL_MINUTES + ' min)',
                'UTC:      ' + start.toISOString(),
                'Visitor:  ' + whenText(start) + ' in ' + visitorTz,
                '',
                'Name:     ' + name,
                'Email:    ' + email,
                'Company:  ' + company,
                '',
                'To do:    send ' + email + ' the video link.',
                '',
                'Message:',
                message || '(none)',
                '',
                'UTM:      ' + utm.join(' / '),
                'Page:     ' + window.location.href,
                'Referrer: ' + (document.referrer || '')
            ].join('\n'),
            company: company,
            preferred_date: key(state.day),
            preferred_time: state.time,
            visitor_timezone: visitorTz,
            utm_source: utm[0], utm_medium: utm[1], utm_campaign: utm[2], utm_content: utm[3],
            referrer: document.referrer || ''
        };

        var label = submitEl.textContent;
        submitEl.disabled = true;
        submitEl.textContent = 'Confirming\u2026';

        fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data || !data.success) throw new Error('rejected');
                if (typeof gtag === 'function') gtag('event', 'generate_lead', { source: utm[0] || 'direct', medium: utm[1] || 'organic', method: 'call_booking' });
                showDone(start, end, name, email);
            })
            .catch(function () {
                submitEl.disabled = false;
                submitEl.textContent = label;
                showError('That did not go through. Please try again, or email <a href="mailto:' + HOST_EMAIL + '">' + HOST_EMAIL + '</a> or call +45 22 40 52 92.');
            });
    });

    if (moreEl) moreEl.addEventListener('click', function () { state.page = Math.min(state.page + 1, MAX_PAGES); renderDays(); });

    var sameTz = false;
    try {
        var a = partsIn(visitorTz, new Date()), b = partsIn(HOME_TZ, new Date());
        sameTz = a.hour === b.hour && a.day === b.day;
    } catch (e) {}
    tzEl.textContent = sameTz ? 'Copenhagen time' : 'Shown in your time (' + visitorTz.replace(/_/g, ' ') + ')';

    // Start with the first working day selected so times are visible immediately
    state.day = workingDays(1)[0];
    renderDays();
    renderTimes();
    renderSummary();
})();

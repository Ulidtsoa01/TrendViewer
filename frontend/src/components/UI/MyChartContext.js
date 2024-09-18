//const Color_Red = '#FF0000';
const Color_Light_Grey = '#D3D3D3';
const Color_Dark_Grey = '#646464';

const MyChartContext = {

    round: function (value) {
        return Math.round(value * 100) / 100.0;
    },

    round3: function (value) {
        return Math.round(value * 1000) / 1000.0;
    },

    setMinMax: function () {
        this.min = 100000;
        this.max = -1;
        for (let i = 0; i < Math.min(this.daysDisplayed, this.quotes.length); i++) {
            let q = this.quotes[i];
            if (q.high > this.max)
                this.max = q.high;
            if (q.low < this.min)
                this.min = q.low;
        }
    },

    setVol: function () {
        this.volMax = 0;
        let volume = 0;
        for (let i = 0; i < Math.min(this.daysDisplayed, this.quotes.length); i++) {
            let q = this.quotes[i];
            if (this.volMax < q.volume)
                this.volMax = q.volume;
            volume = q.volume + volume;
        }
        this.volAvg = volume / Math.min(this.daysDisplayed, this.quotes.length);
    },

    getSMA: function (daysOfSMA, i) {
        let sum = 0.0;
        let total = 0;
        for (let j = i; j < Math.min(this.quotes.length, daysOfSMA + i); j++) {
            let q = this.quotes[j];
            sum = sum + q.close;
            total++;
        }
        if (total > 0) return sum / total;
        return this.quotes[i].close;
    },

    getEMA: function (daysOfEMA, i) {   // note : here the i should use the reverse i in the incoming calls
        //let sum = 0.0;
        let currentEMA = 0.0;
        let prevEMA = 0.0;
        //let k = 2.0 / (1.0 + daysOfEMA);

        prevEMA = this.getSMA(daysOfEMA, Math.min(this.quotes.length - 1, i + daysOfEMA * 4));
        currentEMA = prevEMA;

        // for the rest # of days
        if (this.quotes.length > daysOfEMA) {
            for (let j = Math.min(this.quotes.length - 1, i + daysOfEMA * 4); j >= i; j--) {
                currentEMA = (this.quotes[j].close - prevEMA) * (2.0 / (1.0 + daysOfEMA)) + prevEMA;
                prevEMA = currentEMA;
            }
        }
        return currentEMA;
    },

    getMACD: function (i) {
        return this.getEMA(12, i) - this.getEMA(26, i);
    },

    getMACDSMA: function (daysOfSMA, i) {
        let sum = 0.0;
        let total = 0.0;
        for (let j = i; j < Math.min(this.quotes.length, daysOfSMA + i); j++) {
            sum = sum + this.getMACD(j);
            total++;
        }
        if (total > 0) return sum / total;
        return this.getMACD(i);
    },

    getMACDEMA: function (daysOfEMA, i) {
        // int daysOfEMA = 9;
        //let k = 2.0 / (1.0 + daysOfEMA);
        // get the closing price of the 1st # of EMA days, add them togather and get the sma for the 1st day then calculate from there
        //let sum = 0;
        let prevEMA = 0;
        let currentEMA = 0;

        prevEMA = this.getMACDSMA(daysOfEMA, Math.min(this.quotes.length - 1, i + daysOfEMA * 4));
        currentEMA = prevEMA;

        if (this.quotes.length > daysOfEMA) {
            for (let j = Math.min(this.quotes.length - 1, i + daysOfEMA * 4); j >= i; j--) {
                currentEMA = (this.getMACD(j) - prevEMA) * (2.0 / (1.0 + daysOfEMA)) + prevEMA;
                prevEMA = currentEMA;
            }
        }
        return currentEMA;
    },

    setEMA: function () {
        this.minMACD = 100000000.0;
        this.maxMACD = -100000000.0;

        for (let i = 0; i < Math.min(this.daysDisplayed, this.quotes.length); i++) {
            let ema12 = this.getEMA(12, i);
            let ema26 = this.getEMA(26, i);
            this.quotes[i].ema12 = ema12;
            this.quotes[i].ema26 = ema26;

            if ((ema12 - ema26) > this.maxMACD) this.maxMACD = ema12 - ema26;
            if ((ema12 - ema26) < this.minMACD) this.minMACD = ema12 - ema26;
            this.quotes[i].macd9ema = this.getMACDEMA(9, i);
        }
    },

    setSAR: function () {
        let start = this.quotes.length - 9;  // remember quotes are stored in reverse order
        if (start < 0) return;
        let isRising = true;
        let recentHigh = this.quotes[start + 4].high;
        let recentLow = this.quotes[start + 4].low;
        let prevSAR = recentLow; // start + 4
        let sar;
        let AF = 0.02;

        if (this.quotes[start + 3].sar > 0) {
            if (this.quotes[0].sar > 0) {
                return; // sar had been set before... done...
            } //else {  // when today's price just been added, add today's SAR
            // recalculate it all for now... until if we can just calculate today's SAR later on.
            //}
        }

        for (let i = start + 3; i >= start + 1; i--) {
            let q = this.quotes[i];
            if (q.high > recentHigh) {
                recentHigh = q.high;
            }
            if (q.low < recentLow) {
                recentLow = q.low;
            }
            if (q.low > prevSAR) {
                sar = prevSAR + AF * (recentLow - prevSAR);
                sar = recentLow;
                q.sar = sar;
                //System.out.println(" ser sar " + i + " sar = " + sar);
                isRising = true;
            } else {
                sar = recentHigh;
                q.sar = sar;
                //System.out.println(" ser sar > " + i + " sar = " + sar);
                isRising = false;
            }
            prevSAR = q.sar;
        }

        // if rising SAR

        for (let j = start; j >= 0; j--) {
            let qj = this.quotes[j];
            let qj1 = this.quotes[j + 1];
            prevSAR = qj1.sar;
            //if (j > start - 80) System.out.println(" sar > " + j + " sar = " + getSAR(j+1) + " rise = " + isRising + " prev " + prevSAR + " rh " + recentHigh + " rl " + recentLow);
            if (isRising) {
                if (qj1.sar <= qj.low) {  //Rising SAR      Current SAR = Prior SAR + Prior AF(Prior EP - Prior SAR)
                    qj.sar = qj1.sar + AF * (recentHigh - qj1.sar);

                    // for new high, AF = AF + 0.02 with max up to 0.2
                    if (qj.high > recentHigh) {
                        recentHigh = qj.high;
                        if (AF <= 0.18) {
                            AF = AF + 0.02;
                        }
                    }

                    if (qj.sar >= qj1.low || qj.sar >= qj.low) {
                        qj.saw = Math.min(qj1.low, qj.low);
                    }

                    if (recentHigh < qj.high) {    // Setup for next run when turning to Falling SAR
                        recentHigh = qj.high;
                    }
                } else {            // become Falling SAR      Current SAR = Prior SAR - Prior AF(Prior SAR - Prior EP)
                    isRising = false;
                    if (qj.high > recentHigh) {  //in some case, the high of the day could still be the highest, but its low triggered falling SAR
                        recentHigh = qj.high;
                    }
                    qj.sar = recentHigh;
                    recentLow = qj.low;  // set the recentLow for next run
                    AF = 0.02;
                }
            } else {
                if (qj1.sar >= qj.high) {  // 'Falling SAR

                    qj.sar = qj1.sar - AF * (qj1.sar - recentLow);

                    //  for new low, AF = AF + 0.02 with max up to 0.2
                    if (qj.low < recentLow) {
                        recentLow = qj.low;
                        if (AF <= 0.18) {
                            AF = AF + 0.02;
                        }
                    }

                    if (qj.sar <= qj1.high || qj.sar <= qj.high) {
                        qj.sar = Math.max(qj1.high, qj.high);
                    }

                    if (recentLow > qj.low) {    // Setup for next run when turning to Rising SAR
                        recentLow = qj.low;
                    }

                } else {   // Turning into Rising SAR
                    isRising = true;
                    if (qj.low < recentLow) {    // in some case, the low of the day could still be the lowest, but its high triggered rising SAR
                        recentLow = qj.low;
                    }
                    qj.sar = recentLow;
                    recentHigh = qj.high;    // initialize the recentHigh for next run
                    AF = 0.02;
                }
            }
        } // end for loop
    }, // end of setSAR

    getUnitX: function () {
        return (this.width - this.rightMargin) / this.daysDisplayed;
    },

    posX: function (x) {
        return Math.round(this.width - x * this.getUnitX() - this.rightMargin);
    },

    posY: function (y) {
        let topYoffset = 30;
        let bottomYoffset = 410; // 380 395
        let yunit = (this.height - topYoffset - bottomYoffset) / (this.max - this.min);
        y = y - this.min;
        let ht = this.height - bottomYoffset;
        return ht - Math.floor(y * yunit);
    },

    drawLine: function (x1, y1, x2, y2, context) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    },

    drawGrid: function () {
        let context = this.context;
        context.save();

        // for price grids
        let start = Math.floor(this.min);
        let end = Math.floor(this.max * 1.1);
        let step = Math.max(Math.floor(((this.max * 1.1) - this.min) / 20), 1);
        context.lineWidth = 1;
        let x1 = this.posX(0);
        let x2 = this.posX(this.daysDisplayed);
        for (let i = start; i < end; i = i + step) {
            context.strokeStyle = Color_Light_Grey;
            context.strokeText(i.toString(), this.posX(-1) + 5, this.posY(i));
            context.strokeStyle = Color_Dark_Grey;
            let y = this.posY(i);
            this.drawLine(x1, y, x2, y, context);
        }

        // for vertical grids
        context.strokeStyle = Color_Dark_Grey;
        let y1 = this.posY(this.min);
        for (let i = 0; i < this.daysDisplayed; i = i + 10) {
            let x = this.posX(i);
            this.drawLine(x, y1, x, 0, context);
        }

        context.restore();
    },

    volV: function (y) {   // Volume base position
        let maxSize = 60;
        let base = -193; // 183
        let ht = this.height * 80 / 100;
        let yunit = Math.min((ht * 15 / 100), maxSize) / (this.volMax);
        return ht - Math.floor(y * yunit) + base;
    },

    drawVolume: function () {
        let context = this.context;
        context.save();

        context.lineWidth = Math.max(Math.floor(this.getUnitX() * 2 / 3), 2);

        let vol0 = this.volV(0);
        for (let i = 0; i < Math.min(this.quotes.length, this.daysDisplayed); i++) {
            let q = this.quotes[i];
            if (q.open > q.close) {
                context.strokeStyle = 'red';
            } else if (q.open < q.close) {
                context.strokeStyle = 'white';
            } else {
                context.strokeStyle = 'green';
            }
            let x = this.posX(i);
            this.drawLine(x, vol0, x, this.volV(q.volume), context);
        }
        context.lineWidth = 1;
        context.strokeStyle = 'green';
        //g2d.setFont(new Font(null, Font.PLAIN, 11));
        let lastVol = Math.floor(this.quotes[0].volume / 10000) / 100;
        let volValue = lastVol.toString() + 'M';
        context.strokeText(volValue, this.posX(-1), this.volV(lastVol));

        context.restore();
    },

    // drawName: function () {
    //     let context = this.context;
    //     context.save();

    //     context.font = "normal 100px Verdana";
    //     context.fillStyle = Color_Dark_Grey;
    //     let q = this.quotes[0];
    //     let dateStr = new Date(q.date).toISOString().slice(5, 10);
    //     context.fillText(this.name + " - " + q.close + " on " + dateStr, this.width * 2 / 5 - 200, this.posY(this.min + ((this.max - this.min) / 6)));

    //     context.restore();
    // },

    drawPriceBar: function () {
        let context = this.context;
        context.save();

        let lineWidth = Math.max(Math.floor(this.getUnitX() * 2 / 3), 2);

        for (let i = 0; i < Math.min(this.quotes.length, this.daysDisplayed); i++) {
            let q = this.quotes[i];

            context.lineWidth = 1;
            context.strokeStyle = 'green';
            let x = this.posX(i);
            this.drawLine(x, this.posY(q.low), x, this.posY(q.high), context);

            context.lineWidth = lineWidth;
            if (q.open > q.close) {
                context.strokeStyle = 'red';
            } else if (q.open === q.close) {
                context.strokeStyle = 'green';
            } else {
                context.strokeStyle = 'white';
            }

            let closeYpos = this.posY(q.close);
            if (this.posY(q.close) === this.posY(q.open)) {  // open and close resulting the same grid
                closeYpos = closeYpos + 1;          // just make sure the line drawn here has at least 1 pixel width
            }
            this.drawLine(x, this.posY(q.open), x, closeYpos, context);
        }

        context.lineWidth = 1;
        context.strokeStyle = 'green';
        let q0 = this.quotes[0];
        let closeValue = q0.close.toString();
        //g2d.setFont(new Font(null, Font.PLAIN, 11));
        //context.font = "normal 3px Verdana";
        context.strokeText(closeValue, this.posX(-1) + 15, this.posY(q0.close));

        context.restore();
    },

    drawTarget: function (pointStart, cnt, msg) {
        let context = this.context;
        context.save();

        if (pointStart > 0) {
            let u000 = pointStart;
            //g2d.setPaint('yellow');
            switch (cnt % 3) {
                case 0: context.fillStyle = 'yellow'; break;
                case 1: context.fillStyle = 'cyan'; break;
                case 2: context.fillStyle = 'green'; break;
                default: break;
            }
            //g2d.setFont(new Font(null, Font.BOLD, 11));
            context.font = "normal 8px Verdana";
            let pos0 = this.posX(0);
            let posYU000 = this.posY(u000);
            if (!msg || msg.length === 0) {
                context.fillRect(pos0 + 50, posYU000, 22, 2, 1, 1);
            } else {
                context.fillRect(pos0 + 20, posYU000, 22, 1, 1, 1);
                context.fillText(msg, pos0 + 50, posYU000 + 5);
            }
            let hs = Math.round(u000).toString();
            context.fillText(hs, pos0 + 77, posYU000 + 5);
        }

        context.restore();
    },

    getBBTop: function (daysOfSMA, i) {
        //let sum = 0.0;
        let sma = this.getSMA(20, i);
        let bb = 0.0;
        for (let k = i; k < Math.min(this.quotes.length, daysOfSMA + i); k++) {
            let diff = this.quotes[k].close - sma;
            bb = bb + diff * diff;
        }
        return sma + Math.sqrt(bb / daysOfSMA) * 2;
    },

    getBBBottom: function (daysOfSMA, i) {
        //let sum = 0.0;
        let sma = this.getSMA(20, i);
        let bb = 0.0;
        for (let k = i; k < Math.min(this.quotes.length, daysOfSMA + i); k++) {
            let diff = this.quotes[k].close - sma;
            bb = bb + diff * diff;
        }
        return sma - Math.sqrt(bb / daysOfSMA) * 2;
    },

    drawBBTarget: function () {
        this.drawTarget(this.getBBTop(20, 0), 0, "BB ^");
        this.drawTarget(this.getSMA(20, 0), 1, "BB -");
        this.drawTarget(this.getBBBottom(20, 0), 2, "BB v");
    },

    getVolumeSMA: function (daysOfSMA, i) {
        let sum = 0;
        let total = 0;
        for (let j = i; j < Math.min(this.quotes.length, daysOfSMA + i); j++) {
            sum = sum + this.quotes[j].volume;
            total++;
        }
        if (total > 0) return sum / total;
        return this.quotes[i].volume;
    },

    fillEllipse: function (context, x, y, w, h) {
        let kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        context.beginPath();
        context.moveTo(x, ym);
        context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        context.closePath(); // not used correctly, see comments (use to close off open path)
        context.fill();
    },

    drawWarning: function (x, y, w, c, t) {
        let context = this.context;
        context.save();

        context.paintStyle = c;
        let ww = w;
        if (this.daysDisplayed > 200) ww = 5;
        this.fillEllipse(context, x - (w / 2), y, ww, ww);
        if (t && t.length > 0) {
            context.lineWidth = 1;
            context.strokeText(t, x + w, y + w);
        }

        context.restore();
    },

    drawVolumeSMA: function (sma) {
        let context = this.context;
        context.save();

        let buy = false;
        let sell = false;
        for (let i = Math.min(this.quotes.length - 2, this.daysDisplayed); i >= 0; i--) {
            let q = this.quotes[i];
            context.strokeStyle = 'gray';
            let posXi = this.posX(i);
            this.drawLine(this.posX(i + 1), this.volV(this.getVolumeSMA(sma, i + 1)), posXi, this.volV(this.getVolumeSMA(sma, i)), context);
            if ((this.getVolumeSMA(sma, i) < q.volume) && (q.close < this.getSMA(5, i))) {
                if (sell) {
                    this.drawWarning(posXi, this.volV(-10), 7, 'yellow', '');
                } else {
                    this.drawWarning(posXi, this.volV(-10), 7, 'magenta', '');  // first buy sign magenta
                    sell = true;
                    buy = false;
                }
            }
            if ((this.getVolumeSMA(sma, i) * 1.2 < q.volume) && (q.volume > this.getSMA(5, i))) {
                if (buy) {
                    this.drawWarning(posXi, this.volV(-10), 7, 'blue', '');
                } else {
                    this.drawWarning(posXi, this.volV(-10), 7, 'cyan', ''); // first sell sign cyan
                    buy = true;
                    sell = false;
                }
            }
        }

        context.restore();
    },

    drawOneUsage: function (usage, count) {
        let context = this.context;
        context.save();

        context.lineWidth = 1;
        context.strokeStyle = 'green';
        //g2d.setFont(new Font(null, Font.BOLD, 11));
        context.strokeText(usage, 50 + (this.width / 2) * count, this.volV(0) + 20);

        context.restore();
    },

    drawUsage: function (usage, usage2) {
        this.drawOneUsage(usage, 0);
        this.drawOneUsage(usage2, 1);
    },

    drawMovingAvg: function (sma, color) {
        let context = this.context;
        context.save();

        for (let i = 0; i < Math.min(this.quotes.length - 1, this.daysDisplayed); i++) {
            context.strokeStyle = color;
            this.drawLine(this.posX(i + 1), this.posY(this.getSMA(sma, i + 1)), this.posX(i), this.posY(this.getSMA(sma, i)), context);
        }

        context.restore();
    },

    drawBollinger: function () {
        let context = this.context;
        context.save();

        for (let i = 0; i < Math.min(this.quotes.length - 1, this.daysDisplayed); i++) {
            //let q = this.quotes[i];
            context.strokeStyle = 'cyan';
            let posXi = this.posX(i);
            let posXi1 = this.posX(i + 1);
            this.drawLine(posXi1, this.posY(this.getBBTop(20, i + 1)), posXi, this.posY(this.getBBTop(20, i)), context);
            this.drawLine(posXi1, this.posY(this.getSMA(20, i + 1)), posXi, this.posY(this.getSMA(20, i)), context);
            this.drawLine(posXi1, this.posY(this.getBBBottom(20, i + 1)), posXi, this.posY(this.getBBBottom(20, i)), context);
        }

        context.restore();
    },

    drawGranville: function (sma, sma2, chart) {
        let context = this.context;
        context.save();

        //float[] dash3 = {3f, 2f, 3f};
        let max = -1000000;
        let maxday = 0;
        let min = 1000000;
        let minday = 0;
        for (let i = 0; i < Math.min(this.quotes.length - 1, this.daysDisplayed); i++) {
            // draw my max min envelope
            let diff = this.getSMA(sma, i) - this.getSMA(sma2, i);
            let diff1 = this.getSMA(sma, i + 1) - this.getSMA(sma2, i + 1);
            if (diff > max) {
                max = diff;
                maxday = i;
            }
            if (diff < min) {
                min = diff;
                minday = i;
            }
            if (chart) {
                context.strokeStyle = 'yellow';
                context.setLineDash([2, 3]);
                if (diff >= 0 && diff1 >= 0) {
                    if (diff / this.getSMA(sma2, i) > 0.25)
                        context.strokeStyle = 'green';
                    this.drawLine(this.posX(i + 1), this.posY(this.getSMA(sma, i + 1) + diff1), this.posX(i), this.posY(this.getSMA(sma, i) + diff), context);
                } else if (diff < 0 && diff1 < 0) {
                    if (diff / this.getSMA(sma2, i) < -0.15)
                        context.strokeStyle = 'green';
                    this.drawLine(this.posX(i + 1), this.posY(this.getSMA(sma, i + 1) + diff1), this.posX(i), this.posY(this.getSMA(sma, i) + diff), context);
                }
            }
        }

        let xOffset = Math.floor(this.getUnitX() / 4);

        context.strokeStyle = 'red';
        context.setLineDash([2, 3]);
        if (sma < 13) context.strokeStyle = 'magenta';
        if (sma === 18) context.strokeStyle = 'yellow';
        let maxdayoff = maxday;
        if (maxday === 0) maxdayoff = -1;
        this.drawLine(this.posX(maxdayoff) - xOffset, this.posY(this.getSMA(sma2, maxday)), this.posX(maxdayoff) - xOffset, this.posY(this.getSMA(sma2, maxday) + max), context);
        context.setLineDash([]);
        if (this.getSMA(sma2, maxday) < this.getSMA(sma, maxday)) {
            context.strokeText(sma.toString(), this.posX(maxdayoff) - xOffset, this.posY(this.getSMA(sma2, maxday)) + 15);
        } else {
            context.strokeText(sma.toString(), this.posX(maxdayoff) - xOffset, this.posY(this.getSMA(sma2, maxday)) - 15);
        }

        context.strokeStyle = 'green';
        context.setLineDash([2, 3]);
        if (sma < 13) context.strokeStyle = 'cyan';
        if (sma === 18) context.strokeStyle = 'blue';
        let mindayoff = minday;
        if (minday === 0) mindayoff = -1;
        this.drawLine(this.posX(mindayoff) - xOffset, this.posY(this.getSMA(sma2, minday)), this.posX(mindayoff) - xOffset, this.posY(this.getSMA(sma2, minday) + min), context);
        //if (sma == 18) g2d.setPaint('green');
        context.setLineDash([]);
        if (this.getSMA(sma2, minday) > this.getSMA(sma, minday)) {
            context.strokeText(sma.toString(), this.posX(mindayoff) - xOffset, this.posY(this.getSMA(sma2, minday)) - 15);
        } else {
            context.strokeText(sma.toString(), this.posX(mindayoff) - xOffset, this.posY(this.getSMA(sma2, minday)) + 15);
        }

        context.restore();
    },

    posYPrice: function (y) {   // reverse the y position to its price value
        let topYoffset = 30;
        let bottomYoffset = 410; // 380 395
        let yunit = (this.height - topYoffset - bottomYoffset) / (this.max - this.min);
        let ht = this.height - (bottomYoffset);
        let yvalue = (ht - y) / yunit + this.min;
        return Math.round(yvalue * 100) / 100.0;
    },

    getDayX: function (x) {  // reverse the x position to its corresponding day # in display
        //return new Double((width-x-rightMargin)/getUnitX()).intValue();
        return Math.round((this.width - x - this.rightMargin) / this.getUnitX());
    },

    reverse: function (i) {        // say 300 records : i = 299 - 0  =>  return 0 - 299    so, you can get the quote of the specific day you need.
        if (this.quotes == null) return 0;
        return (this.quotes.length - i - 1);
    },

    getDate: function (i) {
        return this.quotes[i].date;
    },

    drawSellTag: function (x, y, w, color, str) {
        let context = this.context;
        context.save();

        context.fillStyle = color;
        context.moveTo(x - w, y - w);
        context.lineTo(x, y + w);
        context.lineTo(x + w, y - w);
        context.closePath();
        context.fill();
        if (str && str.length > 0) {
            context.fillText(str, x - (Math.max(2, str.length / 2) * w), y - (3 * w));
        }

        context.restore();
    },

    drawBuyTag: function (x, y, w, color, str) {
        let context = this.context;
        context.save();

        context.fillStyle = color;
        context.moveTo(x - w, y + w);
        context.lineTo(x, y - w);
        context.lineTo(x + w, y + w);
        context.closePath();
        context.fill();
        if (str && str.length > 0) {
            context.fillText(str, x - (Math.max(2, str.length / 2) * w), y + (4 * w));
        }

        context.restore();
    },

    isLargeVolume: function (q) {      // > 125%
        return q.volume >= (5 * this.volAvg / 4);
    },

    getTR: function (i) {
        if (i >= this.quotes.length - 1) return 0.0;
        let q = this.quotes[i];
        let q1 = this.quotes[i + 1];
        let v1 = q.high - q.low;
        let v2 = Math.abs(q.high - q1.close);
        let v3 = Math.abs(q.low - q1.close);
        return Math.max(v1, Math.max(v2, v3));
    },

    getTRSMA: function (p, i) {  // p normally is 14 period
        let sum = 0.0;
        let total = 0;
        for (let j = i; j < i + p; j++) {
            sum = sum + this.getTR(j);
            total++;
        }
        if (total > 0) return sum / total;
        return this.getTR(i);
    },

    getTREMA: function (period, i) {
        //let sum = 0.0;
        let currentEMA = 0.0;
        let prevEMA = 0.0;
        let k = 2.0 / (1.0 + period);
        let buffer = period * 3 + 1;
        if (this.quotes.length <= buffer) return currentEMA;

        prevEMA = this.getTRSMA(period, i + period * 2);

        for (let j = Math.min(this.quotes.length - buffer, i + period * 2 - 1); j >= i; j--) {
            currentEMA = (this.getTR(j) - prevEMA) * k + prevEMA;
            prevEMA = currentEMA;
        }
        return prevEMA;
    },

    getDMP: function (i) {
        if (i >= this.quotes.length - 1) return 0.0;
        let q = this.quotes[i];
        let q1 = this.quotes[i + 1];
        let v1 = q.high - q1.high;
        let v2 = -(q.low - q1.low);
        let dmp = 0.0;
        if ((v1 > 0) && (v1 > v2)) dmp = v1;
        return dmp;
    },

    getDMM: function (i) {
        if (i >= this.quotes.length - 1) return 0.0;
        let q = this.quotes[i];
        let q1 = this.quotes[i + 1];
        let v1 = q.high - q1.high;
        let v2 = -(q.low - q1.low);
        let dmm = 0.0;
        if ((v2 > 0) && (v2 > v1)) dmm = v2;
        return dmm;
    },

    getDMPSMA: function (p, i) {  // p normally is 14 period
        let sum = 0.0;
        let total = 0;
        for (let j = i; j < i + p; j++) {
            sum = sum + this.getDMP(j);
            total++;
        }
        if (total > 0) return sum / total;
        return this.getDMP(i);
    },

    getDMMSMA: function (p, i) {  // p normally is 14 period
        let sum = 0.0;
        let total = 0;
        for (let j = i; j < i + p; j++) {
            sum = sum + this.getDMM(j);
            total++;
        }
        if (total > 0) return sum / total;
        return this.getDMM(i);
    },

    getDMPEMA: function (period, i) {
        //let sum = 0.0;
        let currentEMA = 0.0;
        let prevEMA = 0.0;
        let k = 2.0 / (1.0 + period);
        let buffer = period * 3 + 1;
        if (this.quotes.length <= buffer) return currentEMA;

        prevEMA = this.getDMPSMA(period, i + period * 2);

        for (let j = Math.min(this.quotes.length - buffer, i + period * 2 - 1); j >= i; j--) {
            currentEMA = (this.getDMP(j) - prevEMA) * k + prevEMA;
            prevEMA = currentEMA;
        }
        return prevEMA;
    },

    getDMMEMA: function (period, i) {
        //let sum = 0.0;
        let currentEMA = 0.0;
        let prevEMA = 0.0;
        let k = 2.0 / (1.0 + period);
        let buffer = period * 3 + 1;
        if (this.quotes.length <= buffer) return currentEMA;

        prevEMA = this.getDMMSMA(period, i + period * 2);

        for (let j = Math.min(this.quotes.length - buffer, i + period * 2 - 1); j >= i; j--) {
            currentEMA = (this.getDMM(j) - prevEMA) * k + prevEMA;
            prevEMA = currentEMA;
        }
        return prevEMA;
    },

    // +DI = 100 times Exponential Moving Average of (+DM / Average True Range)
    getDMPos: function (period, i) {
        return this.round3(this.getDMPEMA(period, i) * 100 / this.getTREMA(period, i));
    },

    // -DI = 100 times Exponential Moving Average of (-DM / Average True Range)
    getDMMin: function (period, i) {
        return this.round3(this.getDMMEMA(period, i) * 100 / this.getTREMA(period, i));
    },

    getAD: function (i) {
        let period = 30;
        let dmp = this.getDMPos(period, i);
        let dmm = this.getDMMin(period, i);
        return Math.abs((dmp - dmm) / (dmp + dmm));
    },

    getADSMA: function (p, i) {
        let sum = 0.0;
        let total = 0;
        for (let j = i; j < i + p; j++) {
            sum = sum + this.getAD(j);
            total++;
        }
        if (total > 0) return sum / total;
        return this.getAD(i);
    },

    getADEMA: function (period, i) {
        //let sum = 0.0;
        let currentEMA = 0.0;
        let prevEMA = 0.0;
        let k = 2.0 / (1.0 + period);
        let buffer = period * 3 + 1;
        if (this.quotes.length <= buffer) return currentEMA;

        prevEMA = this.getADSMA(period, i + period * 2);

        for (let j = Math.min(this.quotes.length - buffer, i + period * 2 - 1); j >= i; j--) {
            currentEMA = (this.getAD(j) - prevEMA) * k + prevEMA;
            prevEMA = currentEMA;
        }
        return prevEMA;
    },

    // ADX = 100 times the Exponential Moving Average of the Absolute Value of (+DI- -DI) / (+DI + -DI)
    getADX: function (i) {
        let period = 30;
        return this.round(this.getADEMA(period, i) * 100);
    },

    getKDB: function (k, i) { // k = 14, i = Day # ( between Day start - DayNo )
        //  %K = 100[(C - L14)/(H14 - L14)]
        //  LN(Price) is the lowest price over the last N periods
        //  HN(Price) is the highest price over the last N periods
        //  %D is a 3-period simple moving average of %K, SMA_3(%K)
        //  %D-Slow is a 3-period simple moving average of %D, SMA_3(%D).
        let low14 = 100000000.0;
        let high14 = 0.0;

        for (let m = i; m < Math.min(this.quotes.length, i + k); m++) {
            let q = this.quotes[m];
            if (q.low < low14) low14 = q.low;
            if (q.high > high14) high14 = q.high;
        }
        //if (i <= 2) System.out.println(" i = " + i + " kdb = " +  round(100.0 * (this.quotes[i].close - low14) / (high14 - low14)));
        return this.round(100.0 * (this.quotes[i].close - low14) / (high14 - low14));
    },

    getKDK: function (i) { // i = Day # ( between Day start - DayNo )
        //  %D is a 3-period simple moving average of %K, SMA_3(%K)
        //  %D-Slow is a 3-period simple moving average of %D, SMA_3(%D).
        if (i === this.reverse(0)) {
            //System.out.println(" i = reverse 0 = " + reverse(0));
            return this.round(this.getKDB(14, i));
        }
        if (i === this.reverse(1)) {
            //System.out.println(" i = reverse 1 = " + reverse(1));
            return this.round((this.getKDB(14, i) + this.getKDB(14, i + 1)) / 2);
        }
        return this.round((this.getKDB(14, i) + this.getKDB(14, i + 1) + this.getKDB(14, i + 2)) / 3);
    },

    getKDD: function (i) { // i = Day # ( between Day start - DayNo )
        //  %D is a 3-period simple moving average of %K, SMA_3(%K)
        //  %D-Slow is a 3-period simple moving average of %D, SMA_3(%D).
        if (i === this.reverse(0)) {
            return this.round(this.getKDK(i));
        }
        if (i === this.reverse(1)) {
            return this.round((this.getKDK(i) + this.getKDK(i + 1)) / 2);
        }
        return this.round((this.getKDK(i) + this.getKDK(i + 1) + this.getKDK(i + 2)) / 3);
    },

    getKDS: function (i) { // i = Day # ( between Day start - DayNo )
        //  %D is a 3-period simple moving average of %K, SMA_3(%K)
        //  %D-Slow is a 3-period simple moving average of %D, SMA_3(%D).
        if (i === this.reverse(0)) {
            return this.round(this.getKDD(i));
        }
        if (i === this.reverse(1)) {
            return this.round((this.getKDD(i) + this.getKDD(i + 1)) / 2);
        }
        return this.round((this.getKDD(i) + this.getKDD(i + 1) + this.getKDD(i + 2)) / 3);
    },

    getChanges: function (i) {
        if (i < this.reverse(0)) {
            return this.quotes[i].close - this.quotes[i + 1].close;
        } else {
            return 0.0;
        }
    },

    //        ' CALCULATE RSI VALUE ACCORDING TO
    //        '               SUM (UPs)
    //        '               ---------
    //        '                  days                                 100
    //        '       RS = ------------------         RSI = 100 -  ----------
    //        '               SUM(DOWNS)                             1+RS
    //        '               ----------
    //        '                  days
    getRSI: function (days, i) {
        //let rsi;
        let rs = 0.0;
        let rsiUp = 0.0;
        let rsiDown = 0.0;
        //let changes;

        for (let k = i; k < Math.min(i + days - 1, this.reverse(0)); k++) {
            if (this.getChanges(k) > 0.0) {
                rsiUp = rsiUp + this.getChanges(k);
            } else {
                rsiDown = rsiDown - this.getChanges(k);
            }
        }
        if (rsiUp === 0) {
            rs = 0.0;
        } else if (rsiDown === 0) {
            rs = 100.0;
        } else {
            rs = rsiUp / rsiDown;
        }
        //System.out.println(" day # = " + i + " rs = " + rs + " up = "+ round(rsiUp) + " down = " + round(rsiDown) + " rsi = " + new Double(Math.round((100.0 - 100.0 / (1d + rs)))).intValue());
        return Math.round((100.0 - 100.0 / (1.0 + rs)));
    },

    drawInfo: function (xx, yy) {
        let context = this.context;
        context.save();

        let x = 15;                             // display in the left side
        let y = 15;
        let dd = this.getDayX(xx);
        if (dd < 0) dd = 0;                                 // clicked outside of the stock charting area will only display last day info
        if (dd >= this.quotes.length) dd = this.quotes.length - 1;    // when stock has less than daysOfDisplay days of history

        if (xx * 3 < this.width) {
            x = this.width / 5 * 2;      // display in the right side
            this.showInfoOnRight = true;
            if (this.showInfoOnLeft) {
                //refresh();
                this.showInfoOnLeft = false;
            }
        } else {
            this.showInfoOnLeft = true;
            if (this.showInfoOnRight) {
                //refresh();
                this.showInfoOnRight = false;
            }
        }

        //System.out.println(" # day = " + dd);
        //g2d.clearRect(x, y, 150, 300);
        context.fillStyle = 'black';
        context.fillRect(x, y, 175, 475, 5, 5);
        context.strokeStyle = 'white';
        context.strokeRect(x, y, 175, 475, 5, 5);
        //g2d.setFont(new Font(null, Font.BOLD, 12));
        context.font = "bold 12px arial,serif";
        let i = 1;
        let m = -3;
        let xpos = x + 25;
        let xtag = x + 12;
        let q = this.quotes[dd];
        let dateStr = new Date(q.date).toISOString().slice(0, 10);
        context.fillStyle = 'white';
        context.fillText("Date   = " + dateStr + "  " + this.reverse(dd), xpos, y + (15 * i)); i++;                    // date
        context.fillText("Low    = " + q.low.toString(), xpos, y + (15 * i)); i++;                   // low
        context.fillText("Open   = " + q.open.toString(), xpos, y + (15 * i)); i++;                  // open
        context.fillText("Close  = " + q.close.toString(), xpos, y + (15 * i)); i++;                 // close
        context.fillText("High   = " + q.high.toString(), xpos, y + (15 * i)); i++;                  // high
        if (this.isLargeVolume(q)) {
            if (q.close < q.open) {
                this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
            } else {
                this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
            }
        }
        context.fillStyle = 'white';
        if (this.volAvg > 0) {
            context.fillText("Volume = " + q.volume.toString() + "  " +
                this.round(q.volume * 10 / this.volAvg / 10).toString(),
                xpos, y + (15 * i)); i++;                                                                   // volume
        } else {
            context.fillText("Volume = " + q.volume.toString() + "  " + 0,
                xpos, y + (15 * i)); i++;
        }
        this.drawLine(x, y + (15 * i) - 5, x + 175, y + (15 * i) - 5, context); i++;                                                    // separator

        if (q.sar > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("SAR    = " + this.round(q.sar).toString(), xpos, y + (15 * i)); i++;                   // sar

        let sma20 = this.getSMA(20, dd);
        let bbtop20 = this.getBBTop(20, dd);
        if (bbtop20 < q.high) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else if (sma20 < q.close) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("BB Top = " + this.round(bbtop20).toString(), xpos, y + (15 * i)); i++;      // BB Top

        let bbbottom20 = this.getBBBottom(20, dd);
        if (bbbottom20 > q.low || sma20 > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else if (sma20 < q.close) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("BB Btm = " + this.round(bbbottom20).toString(), xpos, y + (15 * i)); i++;   // BB Bottom

        context.strokeStyle = 'yellow';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(5, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 5   = " + this.round(this.getSMA(5, dd)).toString(), xpos, y + (15 * i)); i++;         // Moving Avg

        context.strokeStyle = 'pink';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(10, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 10  = " + this.round(this.getSMA(10, dd)).toString(), xpos, y + (15 * i)); i++;

        context.strokeStyle = 'red';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(13, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 13  = " + this.round(this.getSMA(13, dd)).toString(), xpos, y + (15 * i)); i++;

        context.strokeStyle = 'cyan';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(18, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 18  = " + this.round(this.getSMA(18, dd)).toString(), xpos, y + (15 * i)); i++;

        context.setLineDash([1, 1]);
        context.strokeStyle = 'cyan';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(20, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 20  = " + this.round(this.getSMA(20, dd)).toString(), xpos, y + (15 * i)); i++;

        context.setLineDash([]);
        context.strokeStyle = 'white';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(25, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 25  = " + this.round(this.getSMA(25, dd)).toString(), xpos, y + (15 * i)); i++;

        context.strokeStyle = 'red';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(50, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 50  = " + this.round(this.getSMA(50, dd)).toString(), xpos, y + (15 * i)); i++;

        context.strokeStyle = 'cyan';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(100, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 100 = " + this.round(this.getSMA(100, dd)).toString(), xpos, y + (15 * i)); i++;

        context.strokeStyle = 'green';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getSMA(200, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("MA 200 = " + this.round(this.getSMA(200, dd)).toString(), xpos, y + (15 * i)); i++;

        context.strokeStyle = 'blue';
        this.drawLine(xpos + 110, y + (15 * i) - 5, xpos + 140, y + (15 * i) - 5, context);
        if (this.getEMA(30, dd) > q.close) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        } else {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        }
        context.fillStyle = 'white';
        context.fillText("EMA 30 = " + this.round(this.getEMA(30, dd)).toString(), xpos, y + (15 * i)); i++;
        context.strokeStyle = 'white';
        this.drawLine(x, y + (15 * i) - 5, x + 175, y + (15 * i) - 5, context); i++;                                                    // separator

        let period = 30;
        if (this.getDMPos(period, dd) >= this.getDMMin(period, dd)) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        } else {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'red');
        }

        context.fillStyle = 'white';
        context.fillText("DMI+   = " + this.round(this.getDMPos(period, dd)).toString(), xpos, y + (15 * i)); i++;
        context.fillText("DMI-   = " + this.round(this.getDMMin(period, dd)).toString(), xpos, y + (15 * i)); i++;
        context.fillText("ADX    = " + this.round(this.getADX(dd)).toString(), xpos, y + (15 * i)); i++;

        //if (getMACD_(reverse(dd)) >= q.macd9ema)) {
        if (this.getMACD(dd) >= q.macd9ema) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        } else {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'red');
        }
        context.fillStyle = 'white';
        //context.fillText("MACD   = " + this.round(this.getMACD_(reverse(dd))).toString(), xpos, y+(15*i)); i++;
        context.fillText("MACD   = " + this.round3(this.getMACD(dd)).toString(), xpos, y + (15 * i)); i++;
        context.fillText("MACD9  = " + this.round3(q.macd9ema).toString(), xpos, y + (15 * i)); i++;

        if (this.getKDK(dd) >= this.getKDS(dd)) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        } else {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'red');
        }
        context.fillStyle = 'white';
        context.fillText("KD %K3 = " + this.round3(this.getKDK(dd)).toString(), xpos, y + (15 * i)); i++;
        context.fillText("KD %D3 = " + this.round3(this.getKDS(dd)).toString(), xpos, y + (15 * i)); i++;

        let r1 = 7;
        let r2 = 14;
        let r3 = 28;
        if (this.getRSI(r1, dd) <= 20) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        } else if (this.getRSI(r1, dd) >= 80) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        }
        context.fillStyle = 'white';
        context.fillText("RSI 7  = " + this.round(this.getRSI(r1, dd)).toString(), xpos, y + (15 * i)); i++;
        if (this.getRSI(r2, dd) <= 20) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        } else if (this.getRSI(r2, dd) >= 80) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        }
        context.fillStyle = 'white';
        context.fillText("RSI 14 = " + this.round(this.getRSI(r2, dd)).toString(), xpos, y + (15 * i)); i++;
        if (this.getRSI(r3, dd) <= 20) {
            this.drawBuyTag(xtag, y + (15 * i) + m, 4, 'green');
        } else if (this.getRSI(r3, dd) >= 80) {
            this.drawSellTag(xtag, y + (15 * i) + m, 4, 'yellow');
        }
        context.fillStyle = 'white';
        context.fillText("RSI 28 = " + this.round(this.getRSI(r3, dd)).toString(), xpos, y + (15 * i)); i++;

        context.restore();
    },

    // check if y point is > min price
    inside: function (y) {
        return (y >= this.min * 0.95);  // give it 5% extra area to work with.
    },

    drawFibonacci: function (pointStart, pointEnd, dayStart, dayEnd, cnt) {
        if (dayStart <= 0)
            return;
        let context = this.context;
        context.save();

        context.setLineDash([4, 4]);
        if (pointStart > 0 || pointEnd > 0) {
            let unit = (pointEnd - pointStart);
            let u000 = pointStart;
            let u236 = unit * 0.236 + u000;
            let u382 = unit * 0.382 + u000;
            let u500 = unit * 0.5 + u000;
            let u618 = unit * 0.618 + u000;
            let u1000 = pointEnd;
            let u1618 = unit * 1.618 + u000;
            let u2000 = unit * 2 + u000;
            let u2618 = unit * 2.618 + u000;
            let u4236 = unit * 4.236 + u000;

            switch (cnt % 3) {
                case 0: context.strokeStyle = Color_Light_Grey; break;
                case 1: {
                    if (u000 > u1000) {
                        context.strokeStyle = 'red';
                    } else {
                        context.strokeStyle = 'cyan';
                    }
                    break;
                }
                case 2: {
                    if (u000 > u1000) {
                        context.strokeStyle = 'orange';
                    } else {
                        context.strokeStyle = 'green';
                    }
                    break;
                } //g2d.setPaint(Color.pink); break;
                default: break;
            }
            let off = 150;
            cnt = 0;  // not needed for offset anymore
            //g2d.setPaint(Color.lightGray);
            if (this.inside(u000)) this.drawLine(this.posX(dayEnd), this.posY(u000), this.posX(dayStart), this.posY(u000), context);
            if (this.inside(u236)) this.drawLine(this.posX(dayEnd), this.posY(u236), this.posX(dayStart), this.posY(u236), context);
            if (this.inside(u382)) this.drawLine(this.posX(dayEnd), this.posY(u382), this.posX(dayStart), this.posY(u382), context);
            if (this.inside(u500)) this.drawLine(this.posX(dayEnd), this.posY(u500), this.posX(dayStart), this.posY(u500), context);
            if (this.inside(u618)) this.drawLine(this.posX(dayEnd), this.posY(u618), this.posX(dayStart), this.posY(u618), context);
            if (this.inside(u1000)) this.drawLine(this.posX(dayEnd), this.posY(u1000), this.posX(dayStart), this.posY(u1000), context);
            if (this.inside(u1618)) this.drawLine(this.posX(dayEnd), this.posY(u1618), this.posX(dayStart), this.posY(u1618), context);
            //g2d.setPaint(Color.green);
            if (this.inside(u2000)) this.drawLine(this.posX(dayEnd), this.posY(u2000), this.posX(dayStart), this.posY(u2000), context);
            if (this.inside(u2618)) this.drawLine(this.posX(dayEnd), this.posY(u2618), this.posX(dayStart), this.posY(u2618), context);
            if (this.inside(u4236)) this.drawLine(this.posX(dayEnd), this.posY(u4236), this.posX(dayStart), this.posY(u4236), context);
            //g2d.setPaint(Color.green);
            //if (this.inside(u2000)) this.drawLine(this.posX(0), this.posY(u2000) , this.posX(daysDisplayed), this.posY(u2000), context);
            context.fillStyle = 'cyan';
            context.font = "normal 11px arial,serif";
            //g2d.setFont(new Font(null, Font.PLAIN, 11));
            let fib = "0     " + this.round(u000).toString();
            let startDay = dayStart;
            if (dayEnd < this.daysDisplayed)
                startDay = Math.min(dayStart, this.daysDisplayed);
            if (this.inside(u000))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u000) - 5);
            fib = "23.6%     " + this.round(u236).toString() + "   " + this.round((u236 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u236))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u236) - 5);
            fib = "38.2%     " + this.round(u382).toString() + "   " + this.round((u382 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u382))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u382) - 5);
            fib = "50.0%     " + this.round(u500).toString() + "   " + this.round((u500 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u500))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u500) - 5);
            fib = "61.8%     " + this.round(u618).toString() + "   " + this.round((u618 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u618))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u618) - 5);
            fib = "100%     " + this.round(u1000).toString() + "   " + this.round((u1000 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u1000))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u1000) - 5);
            fib = "161.8%     " + this.round(u1618).toString() + "   " + this.round((u1618 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u1618))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u1618) - 5);
            fib = "200.0%     " + this.round(u2000).toString() + "   " + this.round((u2000 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u2000))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u2000) - 5);
            fib = "261.8%     " + this.round(u2618).toString() + "   " + this.round((u2618 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u2618))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u2618) - 5);
            fib = "423.6%     " + this.round(u4236).toString() + "   " + this.round((u4236 - u000) * 100 / u000).toString() + "%";
            if (this.inside(u4236))
                context.fillText(fib, this.posX(startDay) + 15 + cnt * off, this.posY(u4236) - 5);
        }

        context.restore();
    },

    drawFibs: function () {
        if (!this.fibs || this.fibs.length === 0)
            return;

        let paintContext = this;
        this.fibs.map((fib) => {
            paintContext.drawFibonacci(fib.startPrice, fib.endPrice, fib.startDay, 0, 2);
            return null;
        });
    },

    addFib: function (x, y) {
        let price1 = this.posYPrice(this.anchor.y);
        let price2 = this.posYPrice(y);
        let startDay = this.getDayX(this.anchor.x);
        this.fibs.push({
            startPrice: price1,
            endPrice: price2,
            startDay: startDay
        });

        let oldContext = this.context;
        this.context = this.offscreenContext;

        this.drawFibonacci(price1, price2, startDay, 0, 2);

        this.context = oldContext;
        this.context.drawImage(this.offscreenCanvas, 0, 0);
    },

    drawFibonacciTZ: function (pointStart, pointEnd, cnt) {
        let context = this.context;
        context.save();

        context.setLineDash([4, 4]);
        if (pointStart > 0 || pointEnd > 0) {
            let unit = Math.max((pointEnd - pointStart), 1);
            let u0 = pointStart;
            let u1 = unit + u0;
            let u2 = unit * 2 + u0;
            let u3 = unit * 3 + u0;
            let u5 = unit * 5 + u0;
            let u8 = unit * 8 + u0;
            let u13 = unit * 13 + u0;
            let u21 = unit * 21 + u0;
            let u34 = unit * 34 + u0;
            let u55 = unit * 55 + u0;
            let u89 = unit * 89 + u0;
            let u144 = unit * 144 + u0;
            //          let u233 = unit * 233 + u0;     // After 144 days, re-select the Fib time zone pick from a bottom or peak
            //          let u377 = unit * 377 + u0;
            //          let u610 = unit * 610 + u0;

            switch (cnt % 3) {
                case 0: context.strokeStyle = Color_Light_Grey; context.fillStyle = Color_Light_Grey; break;
                case 1: context.strokeStyle = 'cyan'; context.fillStyle = 'cyan'; break;
                case 2: context.strokeStyle = 'orange'; context.fillStyle = 'orange'; break;
                default: break;
            }
            //System.out.println(" cnt = " + cnt + " u0 = " + u0 + " u1 = " + u1);

            context.font = "normal 11px arial,serif";
            if (this.insideX(this.reverse(u0))) {
                this.drawLine(this.posX(this.reverse(u0)), this.posY(this.max) + 30, this.posX(this.reverse(u0)), this.posY(this.min) - 30, context);
                context.fillText("0 (" + u0 + ")", this.posX(this.reverse(u0)), this.posY(this.max) - 12);
            }
            if (this.insideX(this.reverse(u1))) {
                this.drawLine(this.posX(this.reverse(u1)), this.posY(this.max) + 30, this.posX(this.reverse(u1)), this.posY(this.min) - 30, context);
                if (unit === 1) {
                    context.fillText("1", this.posX(this.reverse(u1)), this.posY(this.max));
                } else {
                    context.fillText("1 (" + u1 + ")", this.posX(this.reverse(u1)), this.posY(this.max));
                }
            }

            if (unit !== 1 && this.insideX(this.reverse(u2))) {
                this.drawLine(this.posX(this.reverse(u2)), this.posY(this.max) + 30, this.posX(this.reverse(u2)), this.posY(this.min) - 30, context);
                context.fillText("2", this.posX(this.reverse(u2)), this.posY(this.max) + 15);
            }
            if (unit !== 1 && this.insideX(this.reverse(u3))) {
                this.drawLine(this.posX(this.reverse(u3)), this.posY(this.max) + 30, this.posX(this.reverse(u3)), this.posY(this.min) - 30, context);
                context.fillText("3", this.posX(this.reverse(u3)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u5))) {
                this.drawLine(this.posX(this.reverse(u5)), this.posY(this.max) + 30, this.posX(this.reverse(u5)), this.posY(this.min) - 30, context);
                context.fillText("5", this.posX(this.reverse(u5)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u8))) {
                this.drawLine(this.posX(this.reverse(u8)), this.posY(this.max) + 30, this.posX(this.reverse(u8)), this.posY(this.min) - 30, context);
                context.fillText("8", this.posX(this.reverse(u8)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u13))) {
                this.drawLine(this.posX(this.reverse(u13)), this.posY(this.max) + 30, this.posX(this.reverse(u13)), this.posY(this.min) - 30, context);
                context.fillText("13", this.posX(this.reverse(u13)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u21))) {
                this.drawLine(this.posX(this.reverse(u21)), this.posY(this.max) + 30, this.posX(this.reverse(u21)), this.posY(this.min) - 30, context);
                context.fillText("21", this.posX(this.reverse(u21)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u34))) {
                this.drawLine(this.posX(this.reverse(u34)), this.posY(this.max) + 30, this.posX(this.reverse(u34)), this.posY(this.min) - 30, context);
                context.fillText("34", this.posX(this.reverse(u34)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u55))) {
                this.drawLine(this.posX(this.reverse(u55)), this.posY(this.max) + 30, this.posX(this.reverse(u55)), this.posY(this.min) - 30, context);
                context.fillText("55", this.posX(this.reverse(u55)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u89))) {
                this.drawLine(this.posX(this.reverse(u89)), this.posY(this.max) + 30, this.posX(this.reverse(u89)), this.posY(this.min) - 30, context);
                context.fillText("89", this.posX(this.reverse(u89)), this.posY(this.max) + 15);
            }
            if (this.insideX(this.reverse(u144))) {
                this.drawLine(this.posX(this.reverse(u144)), this.posY(this.max) + 30, this.posX(this.reverse(u144)), this.posY(this.min) - 30, context);
                context.fillText("144", this.posX(this.reverse(u144)), this.posY(this.max) + 15);
            }
            
            // if (this.insideX(this.reverse(u233))) {
            //     this.drawLine(this.posX(this.reverse(u233)), this.posY(this.max)+30 , this.posX(this.reverse(u233)), this.posY(this.min)-30, context);
            //     context.fillText("233", this.posX(this.reverse(u233)), this.posY(this.max)+15);
            // }
            // if (this.insideX(this.reverse(u377))) {
            //     this.drawLine(this.posX(this.reverse(u377)), this.posY(this.max)+30 , this.posX(this.reverse(u377)), this.posY(this.min)-30, context);
            //     context.fillText("377", this.posX(this.reverse(u377)), this.posY(this.max)+15);
            // }
            // if (this.insideX(this.reverse(u610))) {
            //     this.drawLine(this.posX(this.reverse(u610)), this.posY(this.max)+30 , this.posX(this.reverse(u610)), this.posY(this.min)-30, context);
            //     context.fillText("610", this.posX(this.reverse(u610)), this.posY(this.max)+15);
            // }
        }

        context.restore();
    },

    addFibTZ: function (x, y) {
        let startDay = this.getDayX(this.anchor.x);
        let endDay = this.getDayX(x);
        this.fibtzs.push({
            startDay: startDay,
            endDay: endDay
        });

        let oldContext = this.context;
        this.context = this.offscreenContext;

        if (startDay === endDay)
            this.drawFibonacciTZ(this.reverse(startDay), this.reverse(startDay - 1), this.fibtzs.length - 1);
        else
            this.drawFibonacciTZ(this.reverse(startDay), this.reverse(endDay), this.fibtzs.length - 1);

        this.context = oldContext;
        this.context.drawImage(this.offscreenCanvas, 0, 0);
    },

    drawFibTZs: function () {
        if (!this.fibtzs || this.fibtzs.length === 0)
            return;

        let paintContext = this;
        let cnt = 0;
        this.fibtzs.map((fibtz) => {
            if (fibtz.startDay === fibtz.endDay)
                paintContext.drawFibonacciTZ(paintContext.reverse(fibtz.startDay), paintContext.reverse(fibtz.startDay - 1), cnt);
            else
                paintContext.drawFibonacciTZ(paintContext.reverse(fibtz.startDay), paintContext.reverse(fibtz.endDay), cnt);
            cnt++;
            return null;
        });
    },

    drawLines: function () {
        if (!this.lines || this.lines.length === 0)
            return;

        let paintContext = this;
        let context = this.context;
        context.save();
        context.strokeStyle = 'white';

        this.lines.map((line) => {
            paintContext.drawLine(paintContext.posX(line.startDay), paintContext.posY(line.startPrice),
                paintContext.posX(line.endDay), paintContext.posY(line.endPrice), context);
            return null;
        });

        context.restore();
    },

    addLine: function (x, y) {
        let price1 = this.posYPrice(this.anchor.y);
        let price2 = this.posYPrice(y);
        let startDay = this.getDayX(this.anchor.x);
        let endDay = this.getDayX(x);
        this.lines.push({
            startPrice: price1,
            endPrice: price2,
            startDay: startDay,
            endDay: endDay
        });

        let oldContext = this.context;
        this.context = this.offscreenContext;
        let context = this.context;
        context.save();

        context.strokeStyle = 'white';
        this.drawLine(this.anchor.x, this.anchor.y, x, y, context);

        context.restore();
        this.context = oldContext;
        this.context.drawImage(this.offscreenCanvas, 0, 0);
    },

    drawBoxes: function () {
        if (!this.boxes || this.boxes.length === 0)
            return;

        let paintContext = this;
        let context = this.context;
        context.save();
        context.strokeStyle = 'white';

        this.boxes.map((box) => {
            let sx = paintContext.posX(box.startDay);
            let sy = paintContext.posY(box.startPrice);
            let ex = paintContext.posX(box.endDay);
            let ey = paintContext.posY(box.endPrice);
            paintContext.drawLine(sx, sy, sx, ey, context);
            paintContext.drawLine(sx, ey, ex, ey, context);
            paintContext.drawLine(ex, ey, ex, sy, context);
            paintContext.drawLine(ex, sy, sx, sy, context);
            return null;
        });

        context.restore();
    },

    addBox: function (x, y) {
        let price1 = this.posYPrice(this.anchor.y);
        let price2 = this.posYPrice(y);
        let startDay = this.getDayX(this.anchor.x);
        let endDay = this.getDayX(x);
        this.boxes.push({
            startPrice: price1,
            endPrice: price2,
            startDay: startDay,
            endDay: endDay
        });

        let oldContext = this.context;
        this.context = this.offscreenContext;
        let context = this.context;
        context.save();

        context.strokeStyle = 'white';
        this.drawLine(this.anchor.x, this.anchor.y, this.anchor.x, y, context);
        this.drawLine(this.anchor.x, y, x, y, context);
        this.drawLine(x, y, x, this.anchor.y, context);
        this.drawLine(x, this.anchor.y, this.anchor.x, this.anchor.y, context);

        context.restore();
        this.context = oldContext;
        this.context.drawImage(this.offscreenCanvas, 0, 0);
    },

    drawSRs: function () {
        if (!this.srs || this.srs.length === 0)
            return;

        let paintContext = this;
        let context = this.context;
        context.save();
        context.strokeStyle = 'white';
        context.setLineDash([2, 3]);

        this.srs.map((sr) => {
            paintContext.drawLine(paintContext.posX(paintContext.daysDisplayed), paintContext.posY(sr.price),
                paintContext.posX(0), paintContext.posY(sr.price), context);
            return null;
        });

        context.restore();
    },

    addSR: function (x, y) {
        let price = this.posYPrice(y);
        this.srs.push({
            price: price
        });

        let oldContext = this.context;
        this.context = this.offscreenContext;
        let context = this.context;
        context.save();

        context.strokeStyle = 'white';
        context.setLineDash([2, 3]);
        this.drawLine(this.posX(this.daysDisplayed), y, this.posX(0), y, context);

        context.restore();
        this.context = oldContext;
        this.context.drawImage(this.offscreenCanvas, 0, 0);
    },

    paintLine: function (x, y) {
        let context = this.context;
        context.save();

        this.context.drawImage(this.offscreenCanvas, 0, 0);
        context.strokeStyle = 'white';
        this.drawLine(this.anchor.x, this.anchor.y, x, y, context);

        context.restore();
    },

    paintBox: function (x, y) {
        let context = this.context;
        context.save();

        this.context.drawImage(this.offscreenCanvas, 0, 0);
        context.strokeStyle = 'white';
        this.drawLine(this.anchor.x, this.anchor.y, this.anchor.x, y, context);
        this.drawLine(this.anchor.x, y, x, y, context);
        this.drawLine(x, y, x, this.anchor.y, context);
        this.drawLine(x, this.anchor.y, this.anchor.x, this.anchor.y, context);

        context.restore();
    },

    paintSR: function (x, y) {
        let context = this.context;
        context.save();

        this.context.drawImage(this.offscreenCanvas, 0, 0);
        context.strokeStyle = 'white';
        context.setLineDash([2, 3]);
        this.drawLine(this.posX(this.daysDisplayed), y, this.posX(0), y, context);

        context.restore();
    },

    paintCross: function (x, y) {
        let context = this.context;
        context.save();

        context.strokeStyle = 'white';
        //let y = this.posY(i);
        this.drawLine(x, 0, x, this.height, context);
        this.drawLine(0, y, this.width - 60, y, context);

        let yValue = this.posYPrice(y).toString();
        context.strokeStyle = Color_Light_Grey;
        context.strokeText(yValue, this.posX(0) + 10, y);
        context.strokeText(yValue, this.width / 2, y);
        context.strokeText(yValue, 50, y);
        context.strokeText("(" + this.getDayX(x).toString() + " " + this.reverse(this.getDayX(x)).toString() + ")", x, this.height / 2);
        if (this.name)
            this.drawInfo(x, y);

        this.crossOn = true;
        this.crossX = x;
        this.crossY = y;

        context.restore();
    },

    removeCross: function () {
        if (!this.crossOn)
            return;

        this.context.drawImage(this.offscreenCanvas, 0, 0);
        this.crossOn = false;
    },

    anchor: function (x, y) {
        this.anchor = { x: x, y: y };
    },

    setEnv: function () {
        this.setVol();
        this.setEMA();
        this.setSAR();
        //this.setWAD();
        //this.setOBV();
        //this.setDesc();
    },

    init: function () {
        this.rightMargin = 50;
        this.daysDisplayed = 200;
        this.crossOn = false;

        this.showGranville = true;
        this.showSMA = true;
        this.showBollingerBand = true;
        this.showActivities = true;

        this.paintMode = 'off'; // fib, fibtz, line, hline, box,

        this.fibs = [];
        this.fibtzs = [];
        this.lines = [];
        this.srs = [];
        this.boxes = [];

        this.setMinMax();
        this.setEnv();

        this.showInfoOnRight = false;
        this.showInfoOnLeft = false;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;
        this.offscreenContext = this.offscreenCanvas.getContext('2d');
    },

    // isStockClicked: function (xpos, ypos) {
    //     let xUnitSize = 35;
    //     let initypos = this.volV(0) + 40;
    //     if (ypos < initypos - 14 || ypos > initypos) {
    //         return -1;
    //     }
    //     for (let i = 0; i < this.stocklist.length; i++) {
    //         let stockxpos = this.stocklist[i].xpos;
    //         if (stockxpos > 0 && xpos > stockxpos && xpos < stockxpos + xUnitSize) {
    //             return i;
    //         }
    //     }
    //     return -1;
    // },

    // setStocklistPosition: function () {
    //     let xUnitSize = 40;
    //     let initx = 50;
    //     if (initx + xUnitSize * (this.stocklist.length + 1) <= this.width) {
    //         for (let i = 0; i < this.stocklist.length; i++) {
    //             this.stocklist[i].xpos = initx + i * xUnitSize;
    //         }
    //         return;
    //     }

    //     for (let i = 0; i < this.stocklist.length; i++) {
    //         this.stocklist[i].xpos = -1;
    //     }

    //     let midpos = Math.round(this.width / 2);
    //     let minpos = initx + xUnitSize;
    //     let maxpos = this.width - xUnitSize;
    //     this.stocklist[this.stockindex].xpos = midpos;
    //     for (let i = this.stockindex - 1, currPos = midpos - xUnitSize; i >= 0; i--, currPos -= xUnitSize) {
    //         if (currPos < minpos) {
    //             this.stocklist[i].xpos = -currPos;
    //             break;
    //         } else {
    //             this.stocklist[i].xpos = currPos;
    //         }
    //     }

    //     for (let i = this.stockindex + 1, currPos = midpos + xUnitSize; i < this.stocklist.length; i++, currPos += xUnitSize) {
    //         if (currPos > maxpos) {
    //             this.stocklist[i].xpos = -currPos;
    //             break;
    //         } else {
    //             this.stocklist[i].xpos = currPos;
    //         }
    //     }
    // },

    // drawStocklist: function () {
    //     let context = this.context;
    //     context.save();

    //     this.setStocklistPosition();

    //     context.lineWidth = 1;
    //     //g2d.setFont(new Font(null, Font.BOLD, 12));
    //     let ypos = this.volV(0) + 40;
    //     context.strokeStyle = 'red';
    //     let stat = (this.stockindex + 1) + ' / ' + this.stocklist.length;
    //     context.strokeText(stat, 10, ypos);

    //     for (let i = 0; i < this.stocklist.length; i++) {
    //         if (this.stocklist[i].xpos < -1) {
    //             context.strokeStyle = 'green';
    //             context.strokeText('...', -this.stocklist[i].xpos, ypos);
    //             continue;
    //         } else if (this.stocklist[i].xpos < 0) {
    //             continue;
    //         }
    //         if (i === this.stockindex) {
    //             context.strokeStyle = 'red';
    //         } else {
    //             context.strokeStyle = 'green';
    //         }
    //         context.strokeText(this.stocklist[i].tickerName, this.stocklist[i].xpos, ypos);
    //     }

    //     context.restore();
    // },

    // drawActivityList: function () {
    //     if (!this.activities) {
    //         return;
    //     }

    //     let tmp = "" + this.activities.length + " activities";
    //     for (let i = 0; i < this.activities.length; i++) {
    //         let activity = this.activities[i];
    //         let type = activity.type;
    //         if (type !== 'Buy' && type !== 'Sell') {
    //             continue;
    //         }
    //         if (activity.amount === 0 || activity.price === 0) {
    //             continue;
    //         }
    //         let dateStr = new Date(activity.date).toISOString().slice(0, 10);
    //         tmp += ". " + type + " " + activity.shares + " shares at " + activity.price + " on " + dateStr;
    //     }

    //     let context = this.context;
    //     context.save();

    //     context.lineWidth = 1;
    //     //g2d.setFont(new Font(null, Font.BOLD, 12));
    //     let ypos = this.volV(0) + 60;
    //     context.strokeStyle = 'green';

    //     context.strokeText(tmp, 10, ypos);

    //     context.restore();
    // },

    getDayIndex: function (date) {
        for (let i = 0; i < Math.min(this.daysDisplayed, this.quotes.length); i++) {
            let q = this.quotes[i];
            if (date >= q.date) {
                return i;
            }
        }
        return -1;
    },

    drawActivities: function () {
        if (!this.activities) {
            return;
        }
        let context = this.context;
        context.save();

        context.setLineDash([3, 2]);
        let pos0 = this.posX(0);

        for (let i = 0; i < this.activities.length; i++) {
            let activity = this.activities[i];
            let type = activity.type;
            if (type !== 'Buy' && type !== 'Sell') {
                continue;
            }
            let day = this.getDayIndex(activity.date);
            if (day >= 0) {
                let y = this.posY(activity.price);
                let x = this.posX(day);
                context.strokeStyle = (type === 'Buy') ? 'cyan' : 'yellow';
                this.drawLine(x - 5, y, pos0, y, context);
                //this.context.fillStyle = (type == 'Buy') ? 'cyan' : 'yellow';
                //this.context.fillRect(x-10, y-2, 20, 4);
            }
        }

        context.restore();
    },

    drawSellStop: function () {
        if (!this.sellStop) {
            return;
        }
        let context = this.context;
        context.save();

        context.setLineDash([3, 2]);
        let pos0 = this.posX(0);

        let y = this.posY(this.sellStop);
        let x = this.posX(this.daysDisplayed);
        context.strokeStyle = 'red';
        this.drawLine(x - 5, y, pos0, y, context);

        context.restore();
    },

    showTopIndicators: function () {
        this.drawVolumeSMA(18);

        //this.drawUsage("5/50/200 SMA (Granville), BB, (BOX)", "(18x50 cross + Vol) , (Breakout)");
        //this.drawOneUsage(this.comment, 0);

        //drawRemark(g);
        //drawBox(g);
        //drawBreakout(g);
        if (this.showGranville) {
            this.drawGranville(50, 200, false);
            this.drawGranville(25, 200, false);
            this.drawGranville(13, 200, false);
            this.drawGranville(5, 200, false);
            this.drawGranville(3, 200, false);
            this.drawGranville(2, 200, false);
            this.drawGranville(18, 50, false);
        }
        if (this.showSMA) {
            this.drawMovingAvg(5, 'orange');
            //this.drawMovingAvg(18, 'cyan');
            this.drawMovingAvg(50, 'red');
            this.drawMovingAvg(200, 'green');
        }
        if (this.showBollingerBand) {
            this.drawBBTarget();
            this.drawBollinger(false);
        }
        this.drawFibs();
        this.drawFibTZs();
        this.drawLines();
        this.drawSRs();
        this.drawBoxes();
        //this.drawStocklist();
        //this.drawActivityList();
    },

    paintChart: function (period) {
        switch (period) {
            case 'weekly': this.quotes = this.weeklyQuotes; break;
            case 'monthly': this.quotes = this.monthlyQuotes; break;
            default: this.quotes = this.dailyQuotes; break;
        }
        if (this.period !== period) {
            this.period = period;
            this.init();
        }

        let oldContext = this.context;
        this.context = this.offscreenContext;

        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawVolume();
        //this.drawName();
        this.showTopIndicators();
        this.drawPriceBar();
        if (this.showActivities) {
            this.drawActivities();
        }
        this.drawSellStop();

        this.context = oldContext;
        this.context.drawImage(this.offscreenCanvas, 0, 0);
    },

    increaseSize() {
        let size = this.max - this.min;
        this.min = this.min + (0.1 * size);
        this.max = this.max - (0.1 * size);
        this.paintChart(this.period);
    },

    decreaseSize() {
        let size = this.max - this.min;
        this.min = this.min - (0.1 * size);
        this.max = this.max + (0.1 * size);
        this.paintChart(this.period);
    },

    expandWindow() {
        this.daysDisplayed = this.daysDisplayed + Math.floor(this.daysDisplayed * 0.2);
        this.setEnv();
        this.paintChart(this.period);
    },

    shrinkWindow() {
        this.daysDisplayed = this.daysDisplayed - Math.floor(this.daysDisplayed * 0.2);
        this.setEnv();
        if (this.daysDisplayed < 60)
            this.daysDisplayed = 60;
        this.paintChart(this.period);
    },

    insideX: function (x) {
        return (x <= this.daysDisplayed && x >= -5);  // give it 5% extra area to work with.
    },
};

export default MyChartContext;
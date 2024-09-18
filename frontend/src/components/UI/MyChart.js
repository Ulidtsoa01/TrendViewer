import { useEffect, useRef, useState } from 'react';
import { useNavigate, json } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import styles from './MyChart.module.css';
import MyChartContext from './MyChartContext';
import MyChartLeft from './MyChartLeft';

function createContextLocal(prop) {
  let F = function () {};
  F.prototype = MyChartContext;
  let ctx = new F();
  ctx.width = prop.width;
  ctx.height = prop.height;
  ctx.period = prop.period;
  ctx.quotes = prop.quotes;
  if (ctx.period === 'daily') {
    ctx.dailyQuotes = prop.quotes;
  } else if (ctx.period === 'weekly') {
    ctx.weeklyQuotes = prop.quotes;
  } else if (ctx.period === 'monthly') {
    ctx.monthlyQuotes = prop.quotes;
  }
  ctx.name = prop.name;
  ctx.activities = prop.activities;
  ctx.stockindex = prop.stockindex;
  ctx.sellStop = prop.sellStop;
  ctx.comment = prop.comment;
  return ctx;
}

function MyChart({ stockList, data, slideUrl }) {
  const navigate = useNavigate();
  const canvasRef = useRef();
  const [context, setContext] = useState(null);
  const [climaxChecked, setClimaxChecked] = useState(true);
  const [bbChecked, setBBChecked] = useState(true);
  const [smaChecked, setSMAChecked] = useState(true);
  const [buySellChecked, setBuySellChecked] = useState(true);
  const [toolRadioValue, setToolRadioValue] = useState('off');
  let index = stockList ? stockList.findIndex((h) => h.tickerName === data.tickerName) : 0;

  const toolRadios = [
    { name: 'Fib', value: 'fib' },
    { name: 'FibTZ', value: 'fibtz' },
    { name: 'S/R', value: 'hline' },
    { name: 'Line', value: 'line' },
    { name: 'Box', value: 'box' },
    { name: 'Off', value: 'off' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = createContextLocal({
      width: canvas.offsetWidth - 40,
      height: canvas.offsetHeight - 40,
      period: 'daily',
      quotes: data.quotes,
      activities: data.activities.reverse(),
      stockindex: 0,
      name: data.tickerName,
      sellStop: data.sellStop,
      comment: data.comment,
    });
    ctx.init();
    ctx.context = canvas.getContext('2d');
    setContext(ctx);
    ctx.paintChart('daily');
    /*
        const context = canvas.getContext('2d');


        context.fillStyle = 'red';
        context.lineWidth = 1;
        //context.scale(1, 1);
        context.strokeRect(10, 10, 1000, 1000);
        context.moveTo(0, 0);
        context.lineTo(3000, 1200);
        context.stroke();

        const clickHandler = () => {
            context.fillStyle = 'blue';
            context.strokeRect(0, 0, 1000, 1000);
        };

        canvas.addEventListener('click', clickHandler);
        */

    return () => {
      /*canvas.removeEventListener('click', clickHandler)*/
    };
  }, [stockList, data]);

  const toPrevious = () => (stockList ? navigate(slideUrl + stockList[index - 1].tickerName) : null);
  const toNext = () => (stockList ? navigate(slideUrl + stockList[index + 1].tickerName) : null);

  const keyUpHandler = (e) => {
    if (!stockList) {
      return;
    }
    //console.log("keyUpHandler called.");
    if (e.keyCode === 33) {
      //console.log("PageUp key clicked.");
      if (index > 0) {
        toPrevious();
      }
    } else if (e.keyCode === 34) {
      //console.log("PageDown key clicked.");
      if (index < stockList.length - 1) {
        toNext();
      }
    }
  };

  const mouseDownHandler = (mouseEvent) => {
    if (!context) {
      return;
    }
    //console.log(mouseEvent);
    const x = mouseEvent.clientX - mouseEvent.target.offsetLeft;
    const y = mouseEvent.clientY - mouseEvent.target.offsetTop;
    switch (context.paintMode) {
      case 'fib':
      case 'fibtz':
      case 'line':
      case 'box':
        context.anchor(x, y);
        break;
      case 'hline':
        context.paintMode = 'srdown';
        context.paintSR(x, y);
        break;
      case 'off':
      default:
        context.paintCross(x, y);
        break;
    }
  };

  const mouseUpHandler = (mouseEvent) => {
    if (!context) {
      return;
    }
    const x = mouseEvent.clientX - mouseEvent.target.offsetLeft;
    const y = mouseEvent.clientY - mouseEvent.target.offsetTop;
    switch (context.paintMode) {
      case 'fib':
        setToolRadioValue('off');
        context.paintMode = 'off';
        context.addFib(x, y);
        delete context.anchor;
        break;
      case 'fibtz':
        setToolRadioValue('off');
        context.paintMode = 'off';
        context.addFibTZ(x, y);
        delete context.anchor;
        break;
      case 'line':
        setToolRadioValue('off');
        context.paintMode = 'off';
        context.addLine(x, y);
        delete context.anchor;
        break;
      case 'box':
        setToolRadioValue('off');
        context.paintMode = 'off';
        context.addBox(x, y);
        delete context.anchor;
        break;
      case 'hline':
      case 'srdown':
        setToolRadioValue('off');
        context.paintMode = 'off';
        context.addSR(x, y);
        break;
      case 'off':
      default:
        if (context.crossOn) {
          context.removeCross();
        }
        break;
    }
  };

  const mouseMoveHandler = (mouseEvent) => {
    if (!context) {
      return;
    }
    const x = mouseEvent.clientX - mouseEvent.target.offsetLeft;
    const y = mouseEvent.clientY - mouseEvent.target.offsetTop;
    switch (context.paintMode) {
      case 'fib':
      case 'fibtz':
      case 'line':
        if (context.anchor) {
          context.paintLine(x, y);
        }
        break;
      case 'box':
        if (context.anchor) {
          context.paintBox(x, y);
        }
        break;
      case 'srdown':
        context.paintSR(x, y);
        break;
      case 'off':
      default:
        break;
    }
  };

  const handleClimaxChecked = (e) => {
    setClimaxChecked(e.currentTarget.checked);
    context.showGranville = !context.showGranville;
    context.paintChart(context.period);
  };

  const handleBBChecked = (e) => {
    setBBChecked(e.currentTarget.checked);
    context.showBollingerBand = !context.showBollingerBand;
    context.paintChart(context.period);
  };

  const handleSMAChecked = (e) => {
    setSMAChecked(e.currentTarget.checked);
    context.showSMA = !context.showSMA;
    context.paintChart(context.period);
  };

  const handleClimaxGroupClick = (e) => {
    if (context.showGranville || context.showBollingerBand || context.showSMA) {
      setClimaxChecked(false);
      setBBChecked(false);
      setSMAChecked(false);

      context.showGranville = false;
      context.showBollingerBand = false;
      context.showSMA = false;
    } else {
      setClimaxChecked(true);
      setBBChecked(true);
      setSMAChecked(true);

      context.showGranville = true;
      context.showBollingerBand = true;
      context.showSMA = true;
    }
    context.paintChart(context.period);
  };

  const handleBuySellChecked = (e) => {
    setBuySellChecked(e.currentTarget.checked);
    context.showActivities = !context.showActivities;
    context.paintChart(context.period);
  };

  const handleToolRadiosChange = (e) => {
    setToolRadioValue(e.currentTarget.value);
    context.paintMode = e.currentTarget.value;
  };

  const handleSizeUpClick = (e) => {
    context.increaseSize();
  };

  const handleSizeDownClick = (e) => {
    context.decreaseSize();
  };

  const handleWindowUpClick = (e) => {
    context.expandWindow();
  };

  const handleWindowDownClick = (e) => {
    context.shrinkWindow();
  };

  return (
    <div className={styles.root}>
      <div>
        <MyChartLeft data={data} stockList={stockList} index={index} toPrevious={toPrevious} toNext={toNext} />
      </div>
      <div>
        <div>
          <ButtonGroup className="mb-0">
            <ToggleButton id="climax" type="checkbox" variant="outline-secondary" checked={climaxChecked} value="1" onChange={handleClimaxChecked}>
              Climax
            </ToggleButton>
            <ToggleButton id="BB" type="checkbox" variant="outline-secondary" checked={bbChecked} value="1" onChange={handleBBChecked}>
              BB
            </ToggleButton>
            <ToggleButton id="SMA" type="checkbox" variant="outline-secondary" checked={smaChecked} value="1" onChange={handleSMAChecked}>
              SMA
            </ToggleButton>
            <Button id="ClimaxGroupToggle" variant="secondary" onClick={handleClimaxGroupClick}>
              Toggle
            </Button>
          </ButtonGroup>
          <ButtonGroup className="mb-0">
            <ToggleButton id="Activities" type="checkbox" variant="outline-secondary" checked={buySellChecked} value="1" onChange={handleBuySellChecked}>
              Buy/Sell
            </ToggleButton>
          </ButtonGroup>
          <ButtonGroup className="mb-0">
            {toolRadios.map((radio, idx) => (
              <ToggleButton key={idx} id={`radio-${idx}`} type="radio" variant="outline-secondary" name="radio" value={radio.value} checked={toolRadioValue === radio.value} onChange={handleToolRadiosChange}>
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
          <ButtonGroup className="mb-0">
            <Button id="sizeUp" variant="secondary" onClick={handleSizeUpClick}>
              +
            </Button>
            <Button id="sizeDown" variant="secondary" onClick={handleSizeDownClick}>
              -
            </Button>
            <Button id="windowUp" variant="secondary" onClick={handleWindowUpClick}>
              &lt;
            </Button>
            <Button id="windowDown" variant="secondary" onClick={handleWindowDownClick}>
              &gt;
            </Button>
          </ButtonGroup>
        </div>
        <canvas ref={canvasRef} width="2730" height="1150" tabIndex="0" onKeyUp={keyUpHandler} onMouseDown={mouseDownHandler} onMouseUp={mouseUpHandler} onMouseMove={mouseMoveHandler} />
      </div>
    </div>
  );
}

export default MyChart;

export async function loader({ request, params }) {
  const ticker = params.ticker;
  const response = await fetch('/rest/stocklist/chartdata/' + ticker + '/daily');
  console.log('MyChart loader called for ' + ticker);

  if (!response.ok) {
    // return { isError: true, message: 'Could not fetch events.' };
    // throw new Response(JSON.stringify({ message: 'Could not fetch events.' }), {
    //   status: 500,
    // });
    throw json(
      { message: 'Could not fetch slide data.' },
      {
        status: 500,
      }
    );
  } else {
    const resData = await response.json();
    let filteredActivities = resData.activities.filter((a) => a.type === 'Buy' || a.type === 'Sell' || a.type === 'Split');
    resData.displayActivities = [...filteredActivities].reverse();
    //console.log(resData);
    return resData;
  }
}

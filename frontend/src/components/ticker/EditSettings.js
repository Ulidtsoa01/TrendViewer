import { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import styles from './Ticker.module.css';

function EditSettings(props) {
  const { tickerInfo, onCancelClicked } = props;
  if (!tickerInfo.settings) tickerInfo.settings = {};
  const [sellLimit, setSellLimit] = useState(tickerInfo ? tickerInfo.settings.sellLimit : null);
  const [sellStop, setSellStop] = useState(tickerInfo ? tickerInfo.settings.sellStop : null);
  const [buyLimit, setBuyLimit] = useState(tickerInfo ? tickerInfo.settings.buyLimit : null);
  const [buyStop, setBuyStop] = useState(tickerInfo ? tickerInfo.settings.buyStop : null);
  const [rating, setRating] = useState(tickerInfo ? tickerInfo.settings.rating : '');
  const [tickerClass, setTickerClass] = useState(tickerInfo ? tickerInfo.settings.tickerClass : '');
  const [category, setCategory] = useState(tickerInfo ? tickerInfo.settings.category : '');
  const [bcIndustry, setBcIndustry] = useState(tickerInfo ? tickerInfo.settings.bcIndustry : '');
  const [comment, setComment] = useState(tickerInfo ? tickerInfo.settings.comment : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    fetch('/rest/tinfo/' + Number(tickerInfo._id) + '/settings', {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tickerId: Number(tickerInfo._id),
        sellLimit: sellLimit ? Number(sellLimit) : null,
        sellStop: sellStop ? Number(sellStop) : null,
        buyLimit: buyLimit ? Number(buyLimit) : null,
        buyStop: buyStop ? Number(buyStop) : null,
        rating: rating,
        tickerClass: tickerClass,
        category: category,
        bcIndustry: bcIndustry,
        comment: comment,
      }),
    })
      .then((response) => {
        tickerInfo.settings.sellLimit = sellLimit;
        tickerInfo.settings.sellStop = sellStop;
        tickerInfo.settings.buyLimit = buyLimit;
        tickerInfo.settings.buyStop = buyStop;
        tickerInfo.settings.rating = rating;
        tickerInfo.settings.tickerClass = tickerClass;
        tickerInfo.settings.category = category;
        tickerInfo.settings.bcIndustry = bcIndustry;
        tickerInfo.settings.comment = comment;
        onCancelClicked();
      })
      .catch((err) => {
        console.error(err);
        alert('Edit ticker failed.');
      });
  };

  return (
    <div className={styles.container}>
      <Form className={styles.form} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="tickerName">
          <Form.Label>Ticker</Form.Label>
          <Form.Control type="text" value={tickerInfo.name} disabled />
        </Form.Group>
        <Form.Group className="mb-3" controlId="sellLimit">
          <Form.Label>Sell Limit</Form.Label>
          <Form.Control type="text" value={sellLimit} onChange={(e) => setSellLimit(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="sellStop">
          <Form.Label>Sell Stop</Form.Label>
          <Form.Control type="text" value={sellStop} onChange={(e) => setSellStop(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="buyLimit">
          <Form.Label>Buy Limit</Form.Label>
          <Form.Control type="text" value={buyLimit} onChange={(e) => setBuyLimit(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="buyStop">
          <Form.Label>Buy Stop</Form.Label>
          <Form.Control type="text" value={buyStop} onChange={(e) => setBuyStop(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="rating">
          <Form.Label>Rating</Form.Label>
          <Form.Control type="text" value={rating} onChange={(e) => setRating(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tickerType">
          <Form.Label>Class</Form.Label>
          <Form.Select aria-label="ticker class" value={tickerClass} onChange={(e) => setTickerClass(e.target.value)}>
            <option value=""></option>
            <option value="CORE">CORE</option>
            <option value="TRIM">TRIM</option>
            <option value="MIDTERM">MIDTERM</option>
            <option value="TREND">TREND</option>
            <option value="ROTTEN">ROTTEN</option>
            <option value="SHADOW">SHADOW</option>
            <option value="VALUE">VALUE</option>
            <option value="DIVIDEND">DIVIDEND</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Select aria-label="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="AI">AI</option>
            <option value="Auto">Auto</option>
            <option value="Bond">Bond</option>
            <option value="Comm">Comm</option>
            <option value="Fixed">Fixed</option>
            <option value="Game">Game</option>
            <option value="Gold">Gold</option>
            <option value="Industrial">Industrial</option>
            <option value="Insurance">Insurance</option>
            <option value="Medical">Medical</option>
            <option value="Nuclear">Nuclear</option>
            <option value="Oil">Oil</option>
            <option value="Tech">Tech</option>
            <option value="Utility">Utility</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="bcIndustry">
          <Form.Label>BC Industry</Form.Label>
          <Form.Control type="text" value={bcIndustry} onChange={(e) => setBcIndustry(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="comment">
          <Form.Label>Comment</Form.Label>
          <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
        </Form.Group>

        <Container>
          <Row>
            <Col>
              <Button variant="primary" type="submit">
                Update
              </Button>
            </Col>
            <Col>
              <Button variant="primary" onClick={onCancelClicked}>
                Cancel
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
}
export default EditSettings;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('handleSubmit called');
//     fetch('/rest/tinfo/' + Number(tickerInfo._id) + '/settings', {
//       method: 'PUT',
//       mode: 'cors',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         tickerId: Number(tickerInfo._id),
//         sellLimit: sellLimit ? Number(sellLimit) : null,
//         sellStop: sellStop ? Number(sellStop) : null,
//         buyLimit: buyLimit ? Number(buyLimit) : null,
//         buyStop: buyStop ? Number(buyStop) : null,
//         rating: rating,
//         tickerClass: tickerClass,
//         category: category,
//         bcIndustry: bcIndustry,
//         comment: comment
//       }),
//     })
//       .then((response) => {
//         tickerInfo.settings.sellLimit = sellLimit;
//         onCancelClicked();
//       })
//       .catch((err) => {
//         console.error(err);
//         alert('Edit ticker failed.');
//       });
//   };
//   const handleValueChange = (e) => {
//     tSettings = { ...tSettings, [e.target.id]: e.target.value };
//     // this.setState((inputObj) => ({ ...inputObj, [e.target.id]: e.target.value }));
//     // setInputObj((inputObj) => ({ ...inputObj, [e.target.id]: e.target.value }));
//     // console.log(inputObj);
//     // console.log({ ...tSettings, [e.target.id]: e.target.value });
//     // console.log('id: ', e.target.id, ' value: ', e.target.value);
//     // console.log(
//     //   JSON.stringify({
//     //     tickerId: Number(tickerInfo._id),
//     //     sellLimit: tSettings.sellLimit ? Number(tSettings.sellLimit) : null,
//     //     sellStop: tSettings.sellStop ? Number(tSettings.sellStop) : null,
//     //     buyLimit: tSettings.buyLimit ? Number(tSettings.buyLimit) : null,
//     //     buyStop: tSettings.buyStop ? Number(tSettings.buyStop) : null,
//     //     rating: tSettings.rating || null,
//     //     tickerClass: tSettings.tickerClass || null,
//     //     category: tSettings.category || null,
//     //     bcIndustry: tSettings.bcIndustry || null,
//     //     comment: tSettings.comment || null,
//     //   })
//     // );
//     // console.log(tSettings.tickerClass);
//   };

//   return (
//     <div className={styles.container}>
//       <Form className={styles.form} onSubmit={handleSubmit}>
//         <Form.Group className="mb-3" controlId="tickerName">
//           <Form.Label>Ticker</Form.Label>
//           <Form.Control type="text" defaultValue={tickerInfo.name} disabled />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="sellLimit">
//           <Form.Label>Sell Limit</Form.Label>
//           <Form.Control type="text" defaultValue={tSettings.sellLimit || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="sellStop">
//           <Form.Label>Sell Stop</Form.Label>
//           <Form.Control type="text" defaultValue={tSettings.sellStop || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="buyLimit">
//           <Form.Label>Buy Limit</Form.Label>
//           <Form.Control type="text" defaultValue={tSettings.buyLimit || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="buyStop">
//           <Form.Label>Buy Stop</Form.Label>
//           <Form.Control type="text" defaultValue={tSettings.buyStop || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="rating">
//           <Form.Label>Rating</Form.Label>
//           <Form.Control type="text" defaultValue={tSettings.rating || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="tickerType">
//           <Form.Label>Class</Form.Label>
//           <Form.Select
//             aria-label="ticker class"
//             defaultValue={tSettings.tickerClass || ''}
//             onChange={handleValueChange}
//           >
//             <option value=""></option>
//             <option value="CORE">CORE</option>
//             <option value="TRIM">TRIM</option>
//             <option value="MIDTERM">MIDTERM</option>
//             <option value="TREND">TREND</option>
//             <option value="ROTTEN">ROTTEN</option>
//             <option value="SHADOW">SHADOW</option>
//             <option value="VALUE">VALUE</option>
//             <option value="DIVIDEND">DIVIDEND</option>
//           </Form.Select>
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="category">
//           <Form.Label>Category</Form.Label>
//           <Form.Select aria-label="category" defaultValue={tSettings.category || ''} onChange={handleValueChange}>
//             <option value="AI">AI</option>
//             <option value="Auto">Auto</option>
//             <option value="Bond">Bond</option>
//             <option value="Comm">Comm</option>
//             <option value="Fixed">Fixed</option>
//             <option value="Game">Game</option>
//             <option value="Gold">Gold</option>
//             <option value="Industrial">Industrial</option>
//             <option value="Insurance">Insurance</option>
//             <option value="Medical">Medical</option>
//             <option value="Nuclear">Nuclear</option>
//             <option value="Oil">Oil</option>
//             <option value="Tech">Tech</option>
//             <option value="Utility">Utility</option>
//           </Form.Select>
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="bcIndustry">
//           <Form.Label>BC Industry</Form.Label>
//           <Form.Control type="text" defaultValue={tSettings.bcIndustry || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Form.Group className="mb-3" controlId="comment">
//           <Form.Label>Comment</Form.Label>
//           <Form.Control as="textarea" rows={3} defaultValue={tSettings.comment || ''} onChange={handleValueChange} />
//         </Form.Group>

//         <Container>
//           <Row>
//             <Col>
//               <Button variant="primary" type="submit">
//                 Update
//               </Button>
//             </Col>
//             <Col>
//               <Button variant="primary" onClick={onCancelClicked}>
//                 Cancel
//               </Button>
//             </Col>
//           </Row>
//         </Container>
//       </Form>
//     </div>
//   );
// }
// export default EditSettings;

import React, { useState } from 'react';
import { Container, Grid, Button, TextField, Paper, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { backend } from 'declarations/backend';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      try {
        const result = await backend.calculate(operator, firstOperand, inputValue);
        setDisplay(result.toString());
        setFirstOperand(result);
      } catch (error) {
        setDisplay('Error');
      } finally {
        setLoading(false);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <TextField
          fullWidth
          variant="outlined"
          value={display}
          InputProps={{
            readOnly: true,
            endAdornment: loading && <CircularProgress size={20} />,
          }}
        />
        <Grid container spacing={1}>
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'].map((btn) => (
            <Grid item xs={3} key={btn}>
              <StyledButton
                fullWidth
                variant="contained"
                onClick={() => btn === '.' ? inputDecimal() : inputDigit(btn)}
              >
                {btn}
              </StyledButton>
            </Grid>
          ))}
          <Grid item xs={3}>
            <StyledButton fullWidth variant="contained" color="secondary" onClick={clear}>
              C
            </StyledButton>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          {['+', '-', '*', '/'].map((op) => (
            <Grid item xs={3} key={op}>
              <StyledButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => performOperation(op)}
              >
                {op}
              </StyledButton>
            </Grid>
          ))}
          <Grid item xs={12}>
            <StyledButton
              fullWidth
              variant="contained"
              color="success"
              onClick={() => performOperation('=')}
            >
              =
            </StyledButton>
          </Grid>
        </Grid>
      </StyledPaper>
    </Container>
  );
};

export default App;
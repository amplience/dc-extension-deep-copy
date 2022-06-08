import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText,
  TextField,
  Button,
  makeStyles,
} from '@material-ui/core';
import { ContentItem } from 'dc-management-sdk-js';
import { useState } from 'react';

interface ModalProps {
  open: boolean;
  handleClose: any;
  contentItem: ContentItem | undefined;
  setPrefix: any;
}

const useStyles = makeStyles(() => ({
  paper: {},
  title: {
    padding: '20px 30px',
    borderBottom: '1px solid #E5E5E5',
  },
  content: {
    padding: '30px',
  },
  btns: {
    padding: '30px',
    '& > :not(:first-child)': {
      marginLeft: '20px',
    },
  },
}));

function RenameModal({
  open,
  handleClose,
  contentItem,
  setPrefix,
}: ModalProps) {
  const classes = useStyles();
  const [value, setValue] = useState('');

  return (
    <Dialog
      classes={{
        paper: classes.paper,
      }}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle
        className={classes.title}
      >{`Deep copy "${contentItem?.label}"`}</DialogTitle>
      <DialogContent className={classes.content}>
        <DialogContentText color="textPrimary">
          It is recommended that deep copied content is given a unique name to
          differentiate from the original content.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="prefix"
          label="Prefix"
          type="text"
          fullWidth
          variant="standard"
          helperText="This will be prefixed to all copied content"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions className={classes.btns}>
        <Button variant="text" color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setPrefix(value);
            handleClose();
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RenameModal;

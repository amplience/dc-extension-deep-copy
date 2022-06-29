import React, { useEffect, useState } from 'react';
import {
  IconButton,
  makeStyles,
  Button,
  LinkProps,
  Link,
  TextField,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Refresh } from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { OpenInNew } from '@material-ui/icons';
import Loader from '../../common/Loader';
import CopyLoaderOverlay from '../../common/CopyLoaderOverlay';
import {
  RootStateInt,
  ContentItemsInterface,
  UserInterface,
} from '../../../types/types';
import {
  getSelectedWithDependencies,
  copyItems,
} from '../../store/contentItems/contentItems.actions';
import Table from '../../common/Table';
import RenameModal from './RenameModal';
import { ArrowIcon, AssigneeIcon } from '../../icons/Icons';
import { getColour } from '../../utils/assigneeColour';
import { useStyles as useContentStyles } from '../contentItems/ContentItems';

interface LinkRouterProps extends LinkProps {
  to: string;
}
const useStyles = makeStyles(() => ({
  rightContainer: {
    display: 'flex',
    alignItems: 'center',

    '& button': {
      margin: '0 10px',
    },
  },
  openIcon: {},
  label: {
    fontWeight: 400,
    fontSize: '12px',
    color: '#666666',
    verticalAlign: 'middle',
    display: 'inline-block',
    background: '#F2F2F2',
    borderRadius: '5px',
    padding: '2px 5px',
    marginLeft: '15px',
    minWidth: '50px',
    textAlign: 'center',
  },
  arrow: {
    verticalAlign: 'bottom',
    marginRight: '15px',
  },
  input: {
    width: '100%',
  },
  labelContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '40px',
  },
  validating: {
    color: '#999999',
    fontWeight: 700,
    fontSize: '13px',
  },
  valid: {
    color: '#66CC00',
    fontWeight: 700,
    fontSize: '13px',

    '&:after': {
      content: `url('./Success.svg')`,
      verticalAlign: 'middle',
      margin: '0 10px',
    },
  },
  newTab: {
    display: 'flex',
    border: 'none',
    outline: 'none',
    color: '#039be5',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    cursor: 'pointer',

    '& > svg': {
      marginLeft: '5px',
    },
  },
  notValid: {
    color: '#FF3366',
    fontWeight: 700,
    fontSize: '13px',

    '&:after': {
      content: `url('./Error.svg')`,
      verticalAlign: 'middle',
      margin: '0 10px',
    },
  },
}));

export function LinkRouter(props: LinkRouterProps) {
  return <Link {...props} component={RouterLink as any} />;
}

function Dependencies() {
  const classes = useStyles();
  const contentClasses = useContentStyles();
  const dispatch = useDispatch();
  const { id }: { id: string } = useParams();
  const [changedNames, setName]: any = useState({});
  const [showModal, setShowModal]: any = useState(false);
  const [prefix, setPrefix]: any = useState('');
  const {
    dependencies,
    validation: validationLoading,
    copy,
  }: any = useSelector((state: RootStateInt) => state.loadings);
  const { SDK }: any = useSelector((state: RootStateInt) => state.sdk);
  const {
    selectedDependencies,
    selected,
    validation,
    canCopy,
  }: ContentItemsInterface = useSelector(
    (state: RootStateInt) => state.contentItems
  );

  const setPrefixToNames = (newPrefix: string) => {
    if (selectedDependencies) {
      const updatedData: any = {};
      selectedDependencies.map(({ label, id }) => {
        if (changedNames[id]) {
          return (updatedData[id] = changedNames[id].replace(
            prefix,
            newPrefix
          ));
        }
        return (updatedData[id] = `${newPrefix}${label}`);
      });

      setName({
        ...changedNames,
        ...updatedData,
      });
    }

    setPrefix(newPrefix);
  };

  const [once, setOnce] = useState(false);

  useEffect(() => {
    if (((selected && selected.id !== id) || !selectedDependencies) && !once) {
      dispatch(getSelectedWithDependencies(id));
      setOnce(true);
    }
  }, [selected, id, dispatch, once]);

  const columns = [
    {
      id: '_label',
      ignoreWrap: true,
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (row: any) => (
        <div className={classes.labelContainer}>
          {row.level ? (
            <span
              style={{ marginLeft: row.level > 1 ? `${row.level * 15}px` : '' }}
              className={classes.arrow}
            >
              <ArrowIcon />
            </span>
          ) : (
            ''
          )}
          <TextField
            title={changedNames[row.id] || row.label}
            classes={{ root: classes.input }}
            defaultValue={row.label}
            value={changedNames[row.id] || row.label}
            inputProps={{
              maxLength: 150,
            }}
            onChange={(e) => {
              setName({
                ...changedNames,
                [row.id]: e.target.value,
              });
            }}
          />
          {row.locale ? (
            <span className={classes.label}>{row.locale}</span>
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      id: 'validation',
      width: 200,
      ignoreWrap: true,
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (row: any) => {
        if (validation[row.id]) {
          return (
            <div>
              <span
                className={
                  validation[row.id].isValid ? classes.valid : classes.notValid
                }
              >
                {validation[row.id].isValid ? 'Valid' : 'Invalid'}
              </span>
              {!validation[row.id].isValid ? (
                <button
                  className={classes.newTab}
                  onClick={() => {
                    if (SDK && SDK.applicationNavigator && SDK.options) {
                      const href = SDK.applicationNavigator.openContentItem(
                        { id: row.id },
                        { returnHref: true }
                      );
                      // @ts-ignore
                      SDK.options.window.open(href, '_blank');
                    }
                  }}
                >
                  Review content item
                  <OpenInNew fontSize="small" className={classes.openIcon} />
                </button>
              ) : (
                ''
              )}
            </div>
          );
        }

        return <span className={classes.validating}>Validating...</span>;
      },
    },
    {
      id: 'assignees',
      width: 65,
      className: 'withAssignee',
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (assignees: UserInterface[]) => {
        const assigneesList = assignees
          .map((assignee) =>
            assignee ? `${assignee.firstName} ${assignee.lastName}` : ''
          )
          .join(', ');
        return assignees && assignees.length && assignees[0] ? (
          <div className={contentClasses.assigneeWrap}>
            <div
              title={`Assigned to ${assigneesList}`}
              className={contentClasses.styledAssignee}
              style={{ backgroundColor: getColour(assignees[0]) }}
            >
              <span>
                {assignees[0].firstName
                  ? assignees[0].firstName[0].toUpperCase()
                  : 'U'}
              </span>
            </div>
            {assignees.length > 1 ? `+ ${assignees.length - 1}` : ''}
          </div>
        ) : (
          <AssigneeIcon />
        );
      },
    },
    {
      id: '_status',
      width: 160,
      ignoreWrap: true,
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (row: any) => (
        <span
          style={{
            backgroundColor: row.status ? row.status.color : '',
          }}
          className={contentClasses.workflow}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {row.status ? row.status.label : ''}
          </span>
        </span>
      ),
    },
    {
      id: 'schema',
      width: 200,
      format: (schema: any) =>
        schema && schema.settings ? schema.settings.label : '',
    },
    {
      id: 'lastModifiedDate',
      width: 138,
      format: (lastModifiedDate: string) =>
        new Date(lastModifiedDate)
          .toLocaleString('en-GB', {
            hour12: false,
          })
          .replace(',', '')
          .substring(0, 16),
    },
  ];

  return (
    <>
      <RenameModal
        contentItem={selected}
        open={showModal}
        handleClose={() => setShowModal(false)}
        setPrefix={(prefix: string) => setPrefixToNames(prefix)}
      />
      {dependencies || validationLoading ? (
        <Loader className="content-loader" />
      ) : null}
      <div className={contentClasses.navBarContainer}>
        <div className={contentClasses.leftContainer}>
          <LinkRouter color="inherit" to="/" underline="none">
            <Button variant="text" color="secondary">
              Back
            </Button>
          </LinkRouter>
        </div>
        <div className={classes.rightContainer}>
          <IconButton
            title="Refresh"
            onClick={() => dispatch(getSelectedWithDependencies())}
            aria-label="refresh"
          >
            <Refresh />
          </IconButton>
          <Button
            onClick={() => setShowModal(true)}
            variant="outlined"
            color="secondary"
          >
            Rename
          </Button>
          <Button
            disabled={!canCopy}
            onClick={() => dispatch(copyItems(changedNames))}
            variant="contained"
            color="primary"
          >
            Copy
          </Button>
        </div>
      </div>
      {selectedDependencies && selected && selected.id === id ? (
        <Table
          onDoubleClick={() => {}}
          columns={columns}
          data={selectedDependencies}
        />
      ) : null}
      {copy ? <CopyLoaderOverlay /> : null}
    </>
  );
}

export default Dependencies;

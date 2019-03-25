import React from "react";
import { withStyles } from "material-ui/styles";
import { connect } from "@cerebral/react";
import { state, signal } from "cerebral/tags";
import { TextField, Button } from "material-ui";

const styles = theme => ({
  title: {
    //backgroundColor: "#3F52B5"
  },
  drawerHeader: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 2,
    alignItems: "center",
    backgroundColor: "#3f51b5",
    color: "white",
    justifyContent: "center",
    width: "100%",
    padding: "10px"
  },
  hide: {
    display: "none"
  },
  editFieldButtons: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "column"
  },
  editFieldText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "128px"
  },
  editFieldDrawerBottom: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%"
  },
  editFieldDrawer: {
    display: "flex",
    flexDirection: "column",
    order: 3,
    alignItems: "center"
  },
  textField: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    //marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 0.25,
    minWidth: "200px",
    width: "20%",
    color: "#FAFAFA",
    rightPadding: 10
  }
});

class EditFieldDrawer extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.editFieldDrawer}>
        <div className={classes.drawerHeader}>
          <label htmlFor="Instructions">
            {"(1) Enter names (2) Draw field on the map (3) Save"}
          </label>
        </div>
        <div className={classes.editFieldDrawerBottom}>
          <div className={classes.editFieldText}>
            <TextField
              label="Field name"
              placeholder={`e.g., "Baker 135"...`}
              value={this.props.fieldText}
              onChange={evt =>
                this.props.fieldTextChanged({ value: evt.target.value })
              }
            />
            <TextField
              label="Farm Name"
              placeholder={`e.g., "Baker"`}
              type="farm"
              value={this.props.farmText}
              onChange={evt =>
                this.props.farmTextChanged({ value: evt.target.value })
              }
            />
          </div>
          <div className={classes.editFieldButtons}>
            <Button
              className={classes.editFieldButton}
              variant="raised"
              color="primary"
              onClick={() => {
                this.props.saveEdited({ confirm: true });
              }}
              disabled={this.props.disabledNewField}
            >
              Save
            </Button>
            <Button
              className={classes.editFieldButton}
              variant="raised"
              color="secondary"
              onClick={() => {
                this.props.cancelNewField();
              }}
            >
              Discard
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  {
    fieldText:            state`fields.new_field.name`,
    farmText:             state`fields.new_field.farm.name`,
    fields:               state`fields.records`,
    fieldSuggestionsOpen: state`fields.new_field.field.suggestionsOpen`,
    farmSuggestionsOpen:  state`fields.new_field.farm.suggestionsOpen`,
    fieldId:              state`fields.new_field.id`,
    farmId:               state`fields.new_field.farm.id`,
    disabledNewField:     state`fields.newFieldDisabled`,

    fieldTextChanged:     signal`fields.fieldTextChanged`,
    farmTextChanged:      signal`fields.farmTextChanged`,
    saveEdited:           signal`fields.saveEditedField`,
    cancelNewField:       signal`fields.cancelNewField`
  },
  withStyles(styles, { withTheme: true })(EditFieldDrawer)
);


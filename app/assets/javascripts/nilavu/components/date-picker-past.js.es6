import DatePicker from "nilavu/components/date-picker";

export default DatePicker.extend({
  layoutName: "components/date-picker",

  _opts() {
    return {
      // defaultDate: new Date(),
      maxDate: new Date(),
    };
  }
});

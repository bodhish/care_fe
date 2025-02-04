import loadable from '@loadable/component';
import { Button, Card, CardActions, CardContent, FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import React, { useState } from "react";
import ReCaptcha from "react-google-recaptcha";
import { withTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { DISTRICT_CHOICES, GENDER_TYPES } from "../../Common/constants";
import { validateEmailAddress } from "../../Common/validation";
import { signupUser } from "../../Redux/actions";
import { PhoneNumberField, TextInputField } from "../Common/HelperInputFields";
const PageTitle = loadable( () => import("../Common/PageTitle"));


const optionalFields = [
  "first_name",
  "last_name",
  "email",
  "skill",
  "district",
  "gender",
  "user_type",
];

const useStyles = makeStyles((theme: Theme) => ({
  formTop: {
    marginTop: "80px",
    marginBottom: "70px"
  },
  pdLogo: {
    height: "345px",
    border: "solid 3px white"
  },
  cardActions: {
    padding: 0,
    paddingTop: 16
  }
}));

const RegisterPage = (props: any) => {
  const classes = useStyles();
  const dispatch: any = useDispatch();
  const initForm: any = {
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    user_type: 10,
    district: "",
    phone_number: "",
    gender: "",
    age: "",
    password: "",
    c_password: "",
  };
  const initErr: any = {};
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState(initErr);
  const [isCaptchaEnabled, setCaptcha] = useState(false);
  const { t } = props;
  const captchaKey = '6LdvxuQUAAAAADDWVflgBqyHGfq-xmvNJaToM0pN';

  const validateForm = () => {
    const oldError: any = {};
    let hasError: boolean = false;
    Object.keys(form).map((field: string) => {
      if (optionalFields.indexOf(field) === -1 && !form[field].length) {
        oldError[field] = t("field_required");
        hasError = true;
      } else if (field === "username" && !form[field].match(/^[\w.@+-]+$/)) {
        oldError[field] = t("invalid_username");
        hasError = true;
      } else if (
        field === "email" &&
        form[field].length &&
        !validateEmailAddress(form[field])
      ) {
        oldError[field] = t("invalid_email");
        hasError = true;
      } else if (field === "phone_number") {
        const phoneNumber = parsePhoneNumberFromString(form[field]);
        if (!form[field] || !phoneNumber?.isPossible()) {
          oldError[field] = t("invalid_phone");
          hasError = true;
        }
      } else if (
        (field === "district" || field === "gender") &&
        form[field] === ""
      ) {
        oldError[field] = t("field_required");
        hasError = true;
      } else if (field === "age" && isNaN(form[field])) {
        oldError[field] = t("enter_valid_age");
        hasError = true;
      } else if (
        (field === "password" || field === "c_password") &&
        form["password"] !== form["c_password"]
      ) {
        oldError["c_password"] = t("password_mismatch");
        hasError = true;
      } else if (
        isCaptchaEnabled &&
        field === "captcha" &&
        form[field] === ""
      ) {
        oldError[field] = t("field_required");
        hasError = true;
      }
    });
    if (hasError) {
      setErrors(oldError);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const validForm = validateForm();
    if (validForm) {
      const data = {
        ...form,
        phone_number: parsePhoneNumberFromString(form.phone_number)?.format('E.164'),
      };
      dispatch(signupUser(data)).then((res: any) => {
        if (res.status === 201) {
          window.location.href = "/login";
        }
        if (res.status === 429) {
          setCaptcha(true);
        } else {
          const error = { ...errors };
          Object.keys(res.data).map((field: string) => {
            error[field] = res.data[field][0];
            setErrors(error);
          });
        }
      });
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const formOld = { ...form };
    formOld[name] = value;
    setForm(formOld);
  };

  const handleValueChange = (value: any, name: string) => {
    const formOld = { ...form };
    formOld[name] = value;
    setForm(formOld);
  };

  const onCaptchaChange = (value: any) => {
    if (value && isCaptchaEnabled) {
      const formCaptcha = { ...form };
      formCaptcha["g-recaptcha-response"] = value;
      setForm(formCaptcha);
    }
  };

  return (
    <div className="p-2 max-w-3xl mx-auto">
      <PageTitle title={t("register_page_title")} />

      <Card>
        <form onSubmit={e => handleSubmit(e)}>
          <CardContent>
            <TextInputField
              name="username"
              label={t("username")}
              placeholder=""
              variant="outlined"
              margin="dense"
              InputLabelProps={{ shrink: !!form.username }}
              value={form.username}
              onChange={handleChange}
              errors={errors.username}
            />
            <TextInputField
              name="first_name"
              label={t("first_name")}
              placeholder=""
              variant="outlined"
              margin="dense"
              value={form.first_name}
              onChange={handleChange}
              errors={errors.first_name}
            />
            <TextInputField
              name="last_name"
              label={t("last_name")}
              placeholder=""
              variant="outlined"
              margin="dense"
              value={form.last_name}
              onChange={handleChange}
              errors={errors.last_name}
            />
            <TextInputField
              type="email"
              name="email"
              label={t("email")}
              placeholder=""
              variant="outlined"
              margin="dense"
              value={form.email}
              onChange={handleChange}
              errors={errors.email}
            />

            <PhoneNumberField
              label={t("phone_number")}
              value={form.phone_number}
              onChange={(value: any) => handleValueChange(value, 'phone_number')}
              errors={errors.phone_number}
            />

            <Grid
              container
              justify="space-between"
              alignItems="center"
              spacing={1}
              style={{ marginTop: "5px" }}
            >
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="demo-simple-select-outlined-label">
                    {t("district")}
                  </InputLabel>
                  <Select
                    fullWidth
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    label="District"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {DISTRICT_CHOICES.map(district => {
                      return (
                        <MenuItem
                          key={district.id.toString()}
                          value={district.id}
                        >
                          {district.text}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <span className="text-red-500">{errors.district}</span>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="demo-simple-select-outlined-label">
                    {t("gender")}
                  </InputLabel>
                  <Select
                    fullWidth
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {GENDER_TYPES.map(gender => {
                      return (
                        <MenuItem key={gender.id} value={gender.id}>
                          {gender.text}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <span className="text-red-500">{errors.gender}</span>
                </FormControl>
              </Grid>
            </Grid>
            <TextInputField
              type="tel"
              name="age"
              label={t("age")}
              placeholder=""
              variant="outlined"
              margin="dense"
              value={form.age}
              onChange={handleChange}
              errors={errors.age}
            />
            <TextInputField
              type="password"
              name="password"
              label={t("password")}
              placeholder=""
              variant="outlined"
              margin="dense"
              autoComplete='new-password'
              value={form.password}
              onChange={handleChange}
              errors={errors.password}
            />
            <TextInputField
              type="password"
              name="c_password"
              label={t("confirm_password")}
              placeholder=""
              variant="outlined"
              margin="dense"
              autoComplete='new-password'
              value={form.c_password}
              onChange={handleChange}
              errors={errors.c_password}
            />
            <CardActions className={classes.cardActions}>
              {/*<A href="/forgot-password">Forgot password ?</A>*/}
              <Grid container justify="center">
                {isCaptchaEnabled && (
                  <Grid item>
                    <ReCaptcha
                      sitekey={captchaKey}
                      onChange={onCaptchaChange}
                    />
                    <span className="text-red-500">{errors.captcha}</span>
                  </Grid>
                )}
                <Grid item style={{ display: "flex", padding: 10 }}>
                  <Grid container alignItems="center" justify="center">
                    <Grid item>
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        onClick={e => handleSubmit(e)}
                      >
                        {t("register_hospital")}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardActions>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export const Register = withTranslation()(RegisterPage);
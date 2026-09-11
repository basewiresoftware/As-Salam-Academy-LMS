import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AuthLayout from '../../components/common/AuthLayout';
import DateField from '../../components/common/DateField';
import FormBanner from '../../components/common/FormBanner';
import PrimaryButton from '../../components/common/PrimaryButton';
import SegmentedField from '../../components/common/SegmentedField';
import TextField from '../../components/common/TextField';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { parseDate } from '../../utils/date';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
];

const PROGRAM_OPTIONS = [
  { label: 'Qur\'an', value: 'quran' },
  { label: 'Youth Program', value: 'youth_program' },
  { label: 'Islamic Studies', value: 'islamic_studies' },
];

/** Steps before the per-child steps: your details, then contact. */
const PARENT_STEPS = 2;
/** Steps after the per-child steps: pick a program for each child. */
const PROGRAM_STEPS = 1;

/**
 * Nobody is born in the future, and nobody registering a child here is over a
 * century old. Frozen at module load so rendering stays pure — an app left open
 * across midnight has a day-stale ceiling, which a signup form can live with.
 */
const TODAY = new Date();
const MAX_DOB = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
const MIN_DOB = new Date(TODAY.getFullYear() - 100, TODAY.getMonth(), TODAY.getDate());

const emptyChild = () => ({
  key: `child-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'M',
  program: '',
});

// The date has to parse, not just be non-empty: the field is the only way to
// set it, but the value still reaches here as a string.
const isChildComplete = (child) =>
  Boolean(child.first_name.trim() && child.last_name.trim() && parseDate(child.date_of_birth));

/** Step counter, progress rule, and the heading for the step on screen. */
function StepHeader({ step, total, title, caption }) {
  return (
    <View style={styles.stepHead}>
      <Text style={styles.stepCount}>
        Step {step} of {total}
      </Text>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${(step / total) * 100}%` }]} />
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
      {caption ? <Text style={styles.stepCaption}>{caption}</Text> : null}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    address: '',
    phone_number: '',
  });
  const [children, setChildren] = useState([emptyChild()]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);

  const setField = (name) => (value) => setForm((prev) => ({ ...prev, [name]: value }));

  const setChildField = (key, name) => (value) =>
    setChildren((prev) => prev.map((c) => (c.key === key ? { ...c, [name]: value } : c)));

  const totalSteps = PARENT_STEPS + children.length + PROGRAM_STEPS;
  const childIndex = step - PARENT_STEPS;
  const child = childIndex >= 0 && childIndex < children.length ? children[childIndex] : null;
  const isLastChildStep = Boolean(child) && childIndex === children.length - 1;
  // The program step is the last one, so it carries Create account.
  const isProgramStep = step === totalSteps - 1;

  const detailsComplete = Boolean(
    form.first_name.trim() &&
      form.last_name.trim() &&
      form.username.trim() &&
      form.email.trim() &&
      form.password,
  );
  const contactComplete = Boolean(form.address.trim());

  const programsComplete = children.every((c) => Boolean(c.program));

  // Next is gated on the step you can see, so an error never points off-screen.
  const stepComplete =
    step === 0
      ? detailsComplete
      : step === 1
        ? contactComplete
        : isProgramStep
          ? programsComplete
          : isChildComplete(child);
  const canSubmit =
    detailsComplete && contactComplete && children.every(isChildComplete) && programsComplete;

  const goBack = () => {
    setError(null);
    setStep((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setError(null);
    setStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  /** New children are appended and opened straight away — one child, one step. */
  const addChild = () => {
    setError(null);
    setChildren((prev) => [...prev, emptyChild()]);
    setStep(PARENT_STEPS + children.length);
  };

  const removeCurrentChild = () => {
    if (children.length <= 1) return;
    setError(null);
    setChildren((prev) => prev.filter((_, index) => index !== childIndex));
    // One fewer child means one fewer step; stay put unless we fell off the end.
    setStep((prev) => Math.min(prev, PARENT_STEPS + children.length - 2));
  };

  async function handleSubmit() {
    setError(null);

    try {
      await register({
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
        children: children.map(({ key, date_of_birth, gender, program, ...rest }) => ({
          ...rest,
          date_of_birth: date_of_birth.trim() || null,
          gender: gender || null,
          program: program || null,
        })),
      });
      // No navigation here on purpose: registering signs the family in and
      // flags them as owing, and RootNavigator shows the payment screen.
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  return (
    <AuthLayout
      eyebrow="New families"
      title={'Register your family\nstep by step.'}
      subtitle="Your details, then how we reach you, then each child — one step at a time."
      notice={'Register your child\nin one sitting.'}
      noticeCaption="One form covers the parent account and every child in the family."
      footer={
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={styles.footerText}>
            Already registered? <Text style={styles.footerLink}>Sign in</Text>
          </Text>
        </Pressable>
      }
    >
      {step === 0 ? (
        <View style={styles.step}>
          <StepHeader
            step={1}
            total={totalSteps}
            title="Your details"
            caption="This becomes your sign-in."
          />

          <TextField
            label="First name"
            value={form.first_name}
            onChangeText={setField('first_name')}
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <TextField
            label="Last name"
            value={form.last_name}
            onChangeText={setField('last_name')}
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <TextField
            label="Username"
            value={form.username}
            onChangeText={setField('username')}
            autoCapitalize="none"
            autoCorrect={false}
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <TextField
            label="Email"
            value={form.email}
            onChangeText={setField('email')}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <TextField
            label="Password"
            value={form.password}
            onChangeText={setField('password')}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.step}>
          <StepHeader
            step={2}
            total={totalSteps}
            title="Contact"
            caption="How the academy reaches you."
          />

          <TextField
            label="Home address"
            value={form.address}
            onChangeText={setField('address')}
            multiline
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={[styles.input, styles.textArea]}
          />
          <TextField
            label="Phone number"
            hint="Optional"
            value={form.phone_number}
            onChangeText={setField('phone_number')}
            placeholder="(555) 010-2030"
            keyboardType="phone-pad"
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
        </View>
      ) : null}

      {child ? (
        <View style={styles.step} key={child.key}>
          <StepHeader
            step={step + 1}
            total={totalSteps}
            title={`Child ${childIndex + 1}`}
            caption="At least one child is required to register."
          />

          {children.length > 1 ? (
            <View style={styles.childHead}>
              <Text style={styles.childCount}>
                {childIndex + 1} of {children.length}
              </Text>
              <Pressable onPress={removeCurrentChild} hitSlop={8}>
                <Text style={styles.remove}>Remove this child</Text>
              </Pressable>
            </View>
          ) : null}

          <TextField
            label="First name"
            value={child.first_name}
            onChangeText={setChildField(child.key, 'first_name')}
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <TextField
            label="Last name"
            value={child.last_name}
            onChangeText={setChildField(child.key, 'last_name')}
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <DateField
            label="Date of birth"
            value={child.date_of_birth}
            onChange={setChildField(child.key, 'date_of_birth')}
            placeholder="Choose a date"
            minimumDate={MIN_DOB}
            maximumDate={MAX_DOB}
            labelStyle={styles.fieldLabel}
            hintStyle={styles.fieldHint}
            style={styles.input}
          />
          <SegmentedField
            label="Gender"
            options={GENDER_OPTIONS}
            value={child.gender}
            onChange={setChildField(child.key, 'gender')}
            labelStyle={styles.fieldLabel}
            textStyle={styles.segmentText}
          />
        </View>
      ) : null}

      {isProgramStep ? (
        <View style={styles.step}>
          <StepHeader
            step={totalSteps}
            total={totalSteps}
            title={children.length > 1 ? 'Programs' : 'Program'}
            caption={
              children.length > 1
                ? 'Choose what each child is joining.'
                : 'Choose what your child is joining.'
            }
          />

          {children.map((entry, index) => (
            <SegmentedField
              key={entry.key}
              label={
                children.length > 1
                  ? entry.first_name.trim() || `Child ${index + 1}`
                  : 'Program'
              }
              options={PROGRAM_OPTIONS}
              value={entry.program}
              onChange={setChildField(entry.key, 'program')}
              labelStyle={styles.fieldLabel}
              textStyle={styles.segmentText}
              stacked
            />
          ))}
        </View>
      ) : null}

      <FormBanner message={error} />

      <View style={styles.actions}>
        {isProgramStep ? (
          <PrimaryButton
            label="Create account"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!canSubmit}
            labelStyle={styles.buttonLabel}
          />
        ) : (
          <PrimaryButton
            label="Continue"
            onPress={goNext}
            disabled={!stepComplete}
            labelStyle={styles.buttonLabel}
          />
        )}

        {isLastChildStep ? (
          <PrimaryButton
            label="Add another child"
            variant="outline"
            onPress={addChild}
            disabled={!stepComplete}
            labelStyle={styles.buttonLabel}
          />
        ) : null}

        {step > 0 ? (
          <Pressable onPress={goBack} hitSlop={8} style={styles.backRow}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
        ) : null}
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  step: {
    gap: spacing.md + 2,
  },
  stepHead: {
    gap: spacing.sm,
  },
  stepCount: {
    ...typography.overline,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  progress: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.hairline,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  stepTitle: {
    ...typography.serifMd,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  stepCaption: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },

  // Slightly larger type than the shared defaults, register-page only.
  fieldLabel: {
    fontSize: 12.5,
    letterSpacing: 1.2,
  },
  fieldHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    fontSize: 17,
    lineHeight: 24,
  },
  segmentText: {
    fontSize: 15,
  },
  buttonLabel: {
    fontSize: 16,
  },

  textArea: {
    minHeight: 96,
    borderRadius: radius.lg,
    textAlignVertical: 'top',
    paddingTop: spacing.md - 2,
  },

  childHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childCount: {
    ...typography.overline,
    fontSize: 12.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  remove: {
    ...typography.label,
    fontSize: 14,
    color: colors.danger,
  },

  actions: {
    gap: spacing.sm + 4,
    marginTop: spacing.sm,
  },
  backRow: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  back: {
    ...typography.label,
    fontSize: 15,
    color: colors.textMuted,
  },

  footerText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

/**
 * The five form tabs of Bot settings, one component each, laid out as the Figma
 * "Bot settings · *" frames: an 800px column of rows, dividers between them, and child
 * rows nested under the switch they depend on. Row copy comes from `settingsIndex.ts`, which
 * search reads too. Product cards has its own two-column layout in `BotSettings.tsx`.
 */
import { NativeSelect } from '../Select';
import { TagsInput } from '../TagsInput';
import { ChildRows, Helper, MasterCard, NumberField, RowDivider, SettingRow } from './SettingRow';
import { RichTextField } from './RichTextField';
import {
  FLOW_OPTIONS,
  LANGUAGES,
  RATING_SCALES,
  TRANSCRIPTION_MODELS,
  type BotSettingsValues,
} from './botSettingsValues';
import { SETTING_ENTRIES, row } from './settingsIndex';

const ROWS = Object.fromEntries(SETTING_ENTRIES.map((entry) => [entry.id, entry])) as Record<string, (typeof SETTING_ENTRIES)[number]>;

export interface SectionProps {
  values: BotSettingsValues;
  patch: (next: Partial<BotSettingsValues>) => void;
}

export function BotBehaviourSection({ values, patch }: SectionProps) {
  const ai = values.aiDecisionMaking;
  const reminderOn = ai && values.reminderEnabled;
  return (
    <div className="lc-bset__column">
      <MasterCard
        id="aiDecisionMaking"
        title={ROWS.aiDecisionMaking.label}
        tip={ROWS.aiDecisionMaking.tip}
        badge="Controls this tab"
        description="The bot works out what to do next instead of only following fixed flows."
        note="Two settings in this tab and three in Messaging depend on this."
        checked={ai}
        onChange={(next) => patch({ aiDecisionMaking: next })}
      />

      <SettingRow {...row('noFlowMatch')}>
        <NativeSelect
          aria-label="When no flow matches"
          size="sm"
          wrapperClassName="lc-bset__select"
          placeholder="Select a flow"
          data={FLOW_OPTIONS}
          value={values.noFlowMatchFlow}
          error={values.noFlowMatchFlow === ''}
          onChange={(e) => patch({ noFlowMatchFlow: e.currentTarget.value })}
        />
        {values.noFlowMatchFlow === '' && (
          <Helper error>Required. Nothing is set, so messages that match no flow get no reply at all.</Helper>
        )}
      </SettingRow>

      <RowDivider />

      <SettingRow
        {...row('reminder')}
        checked={values.reminderEnabled}
        onCheckedChange={(next) => patch({ reminderEnabled: next })}
        disabled={!ai}
      >
        <ChildRows active={reminderOn} note={reminderOn ? undefined : 'Available once the reminder is turned on.'}>
          <SettingRow {...row('reminderFlow')} disabled={!reminderOn}>
            <NativeSelect
              aria-label="Reminder flow"
              size="sm"
              wrapperClassName="lc-bset__select"
              placeholder="Select a flow"
              data={FLOW_OPTIONS}
              value={values.reminderFlow}
              disabled={!reminderOn}
              onChange={(e) => patch({ reminderFlow: e.currentTarget.value })}
            />
          </SettingRow>
          <RowDivider />
          <SettingRow {...row('reminderAfter')} disabled={!reminderOn}>
            <NumberField
              label="Send after"
              value={values.reminderAfterSeconds}
              min={60}
              max={86400}
              unit="seconds"
              disabled={!reminderOn}
              onChange={(next) => patch({ reminderAfterSeconds: next })}
            />
            <Helper>60 to 86,400. Default 300.</Helper>
          </SettingRow>
        </ChildRows>
      </SettingRow>

      <RowDivider />

      <SettingRow
        {...row('topicSwitch')}
        disabled={!ai}
      >
        <RichTextField
          label="What the bot says when it switches topic"
          value={values.topicSwitchMessage}
          disabled={!ai}
          onChange={(next) => patch({ topicSwitchMessage: next })}
        />
      </SettingRow>
    </div>
  );
}

export function MessagingSection({ values, patch }: SectionProps) {
  const ai = values.aiDecisionMaking;
  const warmer = ai && values.warmerTone;
  const company = ai && values.companyInstructionsEnabled;
  const translate = ai && values.translateReplies;
  const holding = values.holdingMessageEnabled;
  return (
    <div className="lc-bset__column">
      <SettingRow
        {...row('warmerTone')}
        checked={values.warmerTone}
        onCheckedChange={(next) => patch({ warmerTone: next })}
        disabled={!ai}
      >
        <ChildRows active={warmer}>
          <SettingRow
            {...row('rewritingInstructions')}
            disabled={!warmer}
          >
            <RichTextField
              label="Rewriting instructions"
              value={values.rewritingInstructions}
              disabled={!warmer}
              onChange={(next) => patch({ rewritingInstructions: next })}
            />
          </SettingRow>
        </ChildRows>
      </SettingRow>

      <RowDivider />

      <SettingRow
        {...row('companyInstructionsEnabled')}
        checked={values.companyInstructionsEnabled}
        onCheckedChange={(next) => patch({ companyInstructionsEnabled: next })}
        disabled={!ai}
      >
        <ChildRows active={company}>
          <SettingRow {...row('companyInstructions')} disabled={!company}>
            <RichTextField
              label="Company instructions"
              value={values.companyInstructions}
              disabled={!company}
              onChange={(next) => patch({ companyInstructions: next })}
            />
          </SettingRow>
        </ChildRows>
      </SettingRow>

      <RowDivider />

      <SettingRow
        {...row('translateReplies')}
        checked={values.translateReplies}
        onCheckedChange={(next) => patch({ translateReplies: next })}
        disabled={!ai}
      >
        <ChildRows active={translate}>
          <SettingRow
            {...row('keepButtonLabels')}
            checked={values.keepButtonLabels}
            onCheckedChange={(next) => patch({ keepButtonLabels: next })}
            disabled={!translate}
          />
          <RowDivider />
          <SettingRow
            {...row('supportedLanguages')}
            disabled={!translate}
          >
            <TagsInput
              className="lc-bset__languages"
              ariaLabel="Supported languages"
              data={LANGUAGES}
              value={values.supportedLanguages}
              placeholder="Add a language"
              searchPlaceholder="Add a language"
              disabled={!translate}
              onChange={(next) => patch({ supportedLanguages: next })}
            />
          </SettingRow>
          <RowDivider />
          <SettingRow
            {...row('languageDetectionInstructions')}
            disabled={!translate}
          >
            <RichTextField
              label="Language detection instructions"
              value={values.languageDetectionInstructions}
              disabled={!translate}
              onChange={(next) => patch({ languageDetectionInstructions: next })}
            />
          </SettingRow>
          <RowDivider />
          <SettingRow
            {...row('translationInstructions')}
            disabled={!translate}
          >
            <RichTextField
              label="Translation instructions"
              value={values.translationInstructions}
              disabled={!translate}
              onChange={(next) => patch({ translationInstructions: next })}
            />
          </SettingRow>
        </ChildRows>
      </SettingRow>

      <RowDivider />

      <SettingRow
        {...row('holdingMessageEnabled')}
        checked={values.holdingMessageEnabled}
        onCheckedChange={(next) => patch({ holdingMessageEnabled: next })}
      >
        <ChildRows active={holding}>
          <SettingRow {...row('holdingAfter')} disabled={!holding}>
            <NumberField
              label="Send after"
              value={values.holdingAfterSeconds}
              min={5}
              max={60}
              unit="seconds"
              disabled={!holding}
              onChange={(next) => patch({ holdingAfterSeconds: next })}
            />
            <Helper>5 to 60. Default 15.</Helper>
          </SettingRow>
          <RowDivider />
          <SettingRow {...row('holdingMessage')} disabled={!holding}>
            <RichTextField
              label="Holding message"
              value={values.holdingMessage}
              disabled={!holding}
              onChange={(next) => patch({ holdingMessage: next })}
            />
            <Helper>Up to 120 characters.</Helper>
          </SettingRow>
        </ChildRows>
      </SettingRow>
    </div>
  );
}

export function ChannelsSection({ values, patch }: SectionProps) {
  const voice = values.voiceTranscription;
  const email = values.customEmailSummary;
  return (
    <div className="lc-bset__column">
      <SettingRow
        {...row('voiceTranscription')}
        checked={voice}
        onCheckedChange={(next) => patch({ voiceTranscription: next })}
      >
        <ChildRows active={voice}>
          <SettingRow {...row('transcriptionModel')} disabled={!voice}>
            <NativeSelect
              aria-label="Transcription model"
              size="sm"
              wrapperClassName="lc-bset__select"
              data={TRANSCRIPTION_MODELS}
              value={values.transcriptionModel}
              disabled={!voice}
              onChange={(e) => patch({ transcriptionModel: e.currentTarget.value })}
            />
            <Helper>Default. Change only if accuracy is poor for your languages.</Helper>
          </SettingRow>
        </ChildRows>
      </SettingRow>

      <RowDivider />

      <SettingRow
        {...row('customEmailSummary')}
        checked={email}
        onCheckedChange={(next) => patch({ customEmailSummary: next })}
      >
        <ChildRows active={email}>
          <SettingRow {...row('emailSummaryPrompt')} disabled={!email}>
            <RichTextField
              label="Email summary prompt"
              value={values.emailSummaryPrompt}
              disabled={!email}
              onChange={(next) => patch({ emailSummaryPrompt: next })}
            />
          </SettingRow>
        </ChildRows>
      </SettingRow>
    </div>
  );
}

export function CsatSection({ values, patch }: SectionProps) {
  return (
    <div className="lc-bset__column">
      <SettingRow {...row('surveyRatingScale')}>
        <NativeSelect
          aria-label="Survey rating scale"
          size="sm"
          wrapperClassName="lc-bset__select"
          data={RATING_SCALES}
          value={values.surveyRatingScale}
          onChange={(e) => patch({ surveyRatingScale: e.currentTarget.value })}
        />
        <Helper>Default 5 point.</Helper>
      </SettingRow>
    </div>
  );
}

export function AdvancedSection({ values, patch }: SectionProps) {
  return (
    <div className="lc-bset__column">
      <SettingRow
        {...row('fastModel')}
        checked={values.fastModel}
        onCheckedChange={(next) => patch({ fastModel: next })}
      />
      <RowDivider />
      <SettingRow
        {...row('reuseAnswers')}
        checked={values.reuseAnswers}
        onCheckedChange={(next) => patch({ reuseAnswers: next })}
      />
      <RowDivider />
      <SettingRow
        {...row('executionLogs')}
        checked={values.executionLogs}
        onCheckedChange={(next) => patch({ executionLogs: next })}
      />
      <RowDivider />
      <SettingRow
        {...row('selfHostedImageSearch')}
        checked={values.selfHostedImageSearch}
        onCheckedChange={(next) => patch({ selfHostedImageSearch: next })}
      />
    </div>
  );
}

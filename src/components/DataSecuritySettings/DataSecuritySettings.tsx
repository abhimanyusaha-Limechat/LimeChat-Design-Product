/**
 * DataSecuritySettings — Settings → Data security, HelpDesk product.
 *
 *   <DataSecuritySettings
 *     maskMessagePii={maskMessagePii}
 *     onMaskMessagePiiChange={setMaskMessagePii}
 *     piiTypes={piiTypes}
 *     onPiiTypeChange={(key, next) => ...}
 *   />
 */
import { useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { CloseIcon } from '../icons';
import './DataSecuritySettings.css';

function ShieldIcon() {
  return (
    <svg
      className="lc-dss__header-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9.5 12l1.8 1.8l3.2-3.6" />
    </svg>
  );
}


/** Purely decorative track/thumb — the enclosing row is the actual switch control. */
function SwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="lc-dss__switch-track" data-checked={checked} aria-hidden="true">
      <span className="lc-dss__switch-thumb" />
    </span>
  );
}

/** A whole row acts as the switch's hit target, not just the track. */
function ToggleRow({
  className,
  checked,
  onChange,
  disabled,
  children,
}: {
  className: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={className}
      onClick={() => onChange(!checked)}
    >
      {children}
      <SwitchTrack checked={checked} />
    </button>
  );
}

export type PiiTypeKey =
  | 'aadhaarNumber'
  | 'panNumber'
  | 'cardNumber'
  | 'ifscCode'
  | 'bankAccountNumber'
  | 'internationalPhoneNumber'
  | 'emailAddress'
  | 'upiId'
  | 'drivingLicenceNumber'
  | 'voterId'
  | 'passportNumber'
  | 'otp'
  | 'dateOfBirth';

const PII_TYPE_LABEL: Record<PiiTypeKey, string> = {
  aadhaarNumber: 'Aadhaar number',
  panNumber: 'PAN number',
  cardNumber: 'Credit or debit card number',
  ifscCode: 'IFSC code',
  bankAccountNumber: 'Bank account number',
  internationalPhoneNumber: 'International phone number',
  emailAddress: 'Email address',
  upiId: 'UPI ID',
  drivingLicenceNumber: 'Driving licence number',
  voterId: 'Voter ID',
  passportNumber: 'Passport number',
  otp: 'OTP',
  dateOfBirth: 'Date of birth',
};

const PII_TYPE_DESC: Record<PiiTypeKey, string> = {
  aadhaarNumber: 'Masks 12-digit Aadhaar numbers shared in messages.',
  panNumber: 'Masks PAN card numbers shared in messages.',
  cardNumber: 'Masks credit and debit card numbers shared in messages.',
  ifscCode: 'Masks bank IFSC codes shared in messages.',
  bankAccountNumber: 'Masks bank account numbers shared in messages.',
  internationalPhoneNumber: 'Masks phone numbers from outside the customer’s home country.',
  emailAddress: 'Masks email addresses shared in messages.',
  upiId: 'Masks UPI IDs shared in messages.',
  drivingLicenceNumber: 'Masks driving licence numbers shared in messages.',
  voterId: 'Masks voter ID (EPIC) numbers shared in messages.',
  passportNumber: 'Masks passport numbers shared in messages.',
  otp: 'Masks one-time passwords shared in messages.',
  dateOfBirth: 'Masks dates of birth shared in messages.',
};

const PII_TYPE_ORDER: PiiTypeKey[] = [
  'aadhaarNumber',
  'panNumber',
  'cardNumber',
  'ifscCode',
  'bankAccountNumber',
  'internationalPhoneNumber',
  'emailAddress',
  'upiId',
  'drivingLicenceNumber',
  'voterId',
  'passportNumber',
  'otp',
  'dateOfBirth',
];

export type ProfanityMatchType = 'whole' | 'partial';

export interface ProfanityWord {
  id: string;
  text: string;
  matchType: ProfanityMatchType;
}

export interface DataSecuritySettingsProps {
  maskMessagePii: boolean;
  onMaskMessagePiiChange: (next: boolean) => void;
  piiTypes: Record<PiiTypeKey, boolean>;
  onPiiTypeChange: (key: PiiTypeKey, next: boolean) => void;
  blockProfanity: boolean;
  onBlockProfanityChange: (next: boolean) => void;
  profanityWords: ProfanityWord[];
  onAddProfanityWord: (text: string) => void;
  onRemoveProfanityWord: (id: string) => void;
  onProfanityMatchTypeChange: (id: string, matchType: ProfanityMatchType) => void;
}

export function DataSecuritySettings({
  maskMessagePii,
  onMaskMessagePiiChange,
  piiTypes,
  onPiiTypeChange,
  blockProfanity,
  onBlockProfanityChange,
  profanityWords,
  onAddProfanityWord,
  onRemoveProfanityWord,
  onProfanityMatchTypeChange,
}: DataSecuritySettingsProps) {
  const allSelected = PII_TYPE_ORDER.every((key) => piiTypes[key]);
  const [pendingWord, setPendingWord] = useState('');

  const handleAddWord = () => {
    const text = pendingWord.trim();
    if (!text) return;
    onAddProfanityWord(text);
    setPendingWord('');
  };

  return (
    <div className="lc-dss">
      <ToggleRow
        className="lc-dss__header-row"
        checked={maskMessagePii}
        onChange={onMaskMessagePiiChange}
      >
        <ShieldIcon />
        <span className="lc-dss__header-copy">
          <span className="lc-dss__header-label">Mask message PII</span>
          <span className="lc-dss__header-desc">
            Mask sensitive customer information in WhatsApp and website widget messages
          </span>
        </span>
      </ToggleRow>

      <div className="lc-dss__list">
        <ToggleRow
          className="lc-dss__list-row lc-dss__select-all-row"
          checked={allSelected}
          disabled={!maskMessagePii}
          onChange={(next) => PII_TYPE_ORDER.forEach((key) => onPiiTypeChange(key, next))}
        >
          <span className="lc-dss__list-label">Mask all</span>
        </ToggleRow>

        {PII_TYPE_ORDER.map((key) => (
          <ToggleRow
            key={key}
            className="lc-dss__list-row"
            checked={piiTypes[key]}
            disabled={!maskMessagePii}
            onChange={(next) => onPiiTypeChange(key, next)}
          >
            <span className="lc-dss__list-copy">
              <span className="lc-dss__list-label">{PII_TYPE_LABEL[key]}</span>
              <span className="lc-dss__desc">{PII_TYPE_DESC[key]}</span>
            </span>
          </ToggleRow>
        ))}

        <ToggleRow
          className="lc-dss__list-row"
          checked={blockProfanity}
          onChange={onBlockProfanityChange}
        >
          <span className="lc-dss__list-copy">
            <span className="lc-dss__list-label">Block profanity</span>
            <span className="lc-dss__desc">
              Stop agents from sending profanity or any word your team should never send
            </span>
          </span>
        </ToggleRow>

        <div className="lc-dss__profanity-panel" data-disabled={!blockProfanity}>
          <div className="lc-dss__profanity-add">
            <input
              className="lc-dss__profanity-input"
              placeholder="Add a word or phrase to block"
              value={pendingWord}
              disabled={!blockProfanity}
              onChange={(e) => setPendingWord(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWord();
                }
              }}
            />
            <Button
              variant="filled"
              color="primary"
              size="sm"
              disabled={!blockProfanity || !pendingWord.trim()}
              onClick={handleAddWord}
            >
              Add
            </Button>
          </div>

          {profanityWords.length > 0 ? (
            <ul className="lc-dss__profanity-list">
              {profanityWords.map((word) => (
                <li key={word.id} className="lc-dss__profanity-item">
                  <span className="lc-dss__profanity-text">&ldquo;{word.text}&rdquo;</span>
                  <div
                    className="lc-dss__profanity-match"
                    role="radiogroup"
                    aria-label={`Match type for "${word.text}"`}
                  >
                    <Tooltip label="Only blocks messages containing this exact word or phrase">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={word.matchType === 'whole'}
                        data-active={word.matchType === 'whole'}
                        disabled={!blockProfanity}
                        onClick={() => onProfanityMatchTypeChange(word.id, 'whole')}
                      >
                        Whole
                      </button>
                    </Tooltip>
                    <Tooltip label="Blocks any message containing this text as part of a larger word">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={word.matchType === 'partial'}
                        data-active={word.matchType === 'partial'}
                        disabled={!blockProfanity}
                        onClick={() => onProfanityMatchTypeChange(word.id, 'partial')}
                      >
                        Part
                      </button>
                    </Tooltip>
                  </div>
                  <button
                    type="button"
                    className="lc-dss__profanity-remove"
                    aria-label={`Remove "${word.text}"`}
                    disabled={!blockProfanity}
                    onClick={() => onRemoveProfanityWord(word.id)}
                  >
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lc-dss__profanity-empty">
              No words or phrases blocked yet — add one above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSecuritySettings;

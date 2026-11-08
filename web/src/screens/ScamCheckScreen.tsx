/**
 * Screen 6: Instant Scam Check — Input Screen
 * The senior chooses one input method first, then sees only that input.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Camera, CircleCheck, CircleHelp, FileText, MessageSquareText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

type InputMode = 'text' | 'photo' | 'file';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ScamCheckScreen: React.FC = () => {
  const { runScamCheck, scamCheckError, clearScamCheckError, fontSize, highContrast } = useApp();
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const getBodySize = () => {
    switch (fontSize) {
      case 'standard':
        return 20;
      case 'extra_large':
        return 24;
      case 'large':
      default:
        return 22;
    }
  };

  const canCheck =
    inputMode === 'text'
      ? Boolean(inputText.trim())
      : inputMode === 'photo'
        ? Boolean(imagePreview)
        : Boolean(selectedFile);

  useEffect(() => {
    if (!isAnalyzing) {
      setProgressStep(0);
      return;
    }
    const timer = setTimeout(() => setProgressStep(1), 1400);
    return () => clearTimeout(timer);
  }, [isAnalyzing]);

  const selectMode = (mode: InputMode) => {
    setInputMode(mode);
    setFileError(null);
    clearScamCheckError();
  };

  const handleCheck = async () => {
    if (!canCheck || isAnalyzing) return;
    setIsAnalyzing(true);
    setFileError(null);
    clearScamCheckError();

    try {
      const result =
        inputMode === 'text'
          ? await runScamCheck({ text: inputText.trim() })
          : inputMode === 'photo'
            ? await runScamCheck({
                imageBase64: imagePreview?.split(',')[1] || imagePreview || undefined,
                imageMime,
                channel: 'photo',
              })
            : await runScamCheck({
                file: selectedFile ?? undefined,
                channel: selectedFile?.type.startsWith('image/') ? 'photo' : 'file',
              });

      navigate(result.stopScreenRequired ? ROUTES.checkStop : ROUTES.checkResult);
    } catch {
      // AppContext already turned the failure into calm copy.
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    clearScamCheckError();
    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setSelectedFile(null);
      setImagePreview(null);
      setFileError('That file is too big. Please share a smaller photo or file.');
      return;
    }
    setFileError(null);
    clearScamCheckError();
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setImageMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const chooseExample = (text: string) => {
    setInputText(text);
    setShowExamples(false);
  };

  const presets = [
    {
      label: 'USPS $1.99 delivery fee',
      text: 'USPS: Your package is on hold due to an unpaid $1.99 redelivery fee. Pay within 12 hours: usps-redeliver.example.com',
    },
    {
      label: 'WhatsApp 6-digit code',
      text: 'WhatsApp: We received a request to reset your PIN. Please send the 6-digit code to verify this request.',
    },
    {
      label: 'CVS pharmacy pickup',
      text: 'CVS: Your prescription for Lisinopril is ready for pickup at 450 Main St. Store hours today until 8:00 PM.',
    },
  ];

  const selectedBackground = highContrast ? '#123A27' : '#E4EEE6';
  const selectedText = highContrast ? '#FFFFFF' : '#183E2A';
  const selectedIcon = highContrast ? '#FFFFFF' : '#1E5E3A';
  const unselectedBackground = highContrast ? '#1E293B' : '#FFFFFF';
  const unselectedBorder = highContrast ? '#FFFFFF' : '#CDD8D2';
  const unselectedText = highContrast ? '#FFFFFF' : '#17212B';
  const unselectedIcon = highContrast ? '#E2E8F0' : '#435159';

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader
        title="Scam Check"
        showBack
        onBack={() => navigate(ROUTES.home)}
        showPersonMenu
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Heading level={1} style={styles.screenTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
            Check a suspicious message
          </Heading>
          <Text
            style={[
              styles.screenSubtitle,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#CBD5E1' : '#475569',
              },
            ]}
          >
            What do you have?
          </Text>
        </View>

        <View
          role="radiogroup"
          aria-label="Choose how to share the message"
          style={styles.choiceGrid}
        >
          <Pressable
            onPress={() => selectMode('text')}
            accessibilityRole="radio"
            aria-checked={inputMode === 'text'}
            accessibilityLabel="Type or paste a message"
            style={({ pressed }: { pressed: boolean }) => [
              styles.choiceCard,
              {
                backgroundColor:
                  inputMode === 'text' ? selectedBackground : unselectedBackground,
                borderColor: inputMode === 'text' ? selectedIcon : unselectedBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.choiceTitleRow}>
              <MessageSquareText
                size={26}
                strokeWidth={2.3}
                color={inputMode === 'text' ? selectedIcon : unselectedIcon}
                aria-hidden="true"
                focusable="false"
              />
              <Text
                style={[
                  styles.choiceTitle,
                  { color: inputMode === 'text' ? selectedText : unselectedText },
                ]}
              >
                Type or paste
              </Text>
            </View>
            {inputMode === 'text' && (
              <View style={styles.choiceCheck}>
                <CircleCheck
                  size={22}
                  strokeWidth={2.4}
                  color={selectedIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => selectMode('photo')}
            accessibilityRole="radio"
            aria-checked={inputMode === 'photo'}
            accessibilityLabel="Take a photo of a message"
            style={({ pressed }: { pressed: boolean }) => [
              styles.choiceCard,
              {
                backgroundColor:
                  inputMode === 'photo' ? selectedBackground : unselectedBackground,
                borderColor: inputMode === 'photo' ? selectedIcon : unselectedBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.choiceTitleRow}>
              <Camera
                size={26}
                strokeWidth={2.3}
                color={inputMode === 'photo' ? selectedIcon : unselectedIcon}
                aria-hidden="true"
                focusable="false"
              />
              <Text
                style={[
                  styles.choiceTitle,
                  { color: inputMode === 'photo' ? selectedText : unselectedText },
                ]}
              >
                Take a photo
              </Text>
            </View>
            {inputMode === 'photo' && (
              <View style={styles.choiceCheck}>
                <CircleCheck
                  size={22}
                  strokeWidth={2.4}
                  color={selectedIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => selectMode('file')}
            accessibilityRole="radio"
            aria-checked={inputMode === 'file'}
            accessibilityLabel="Send a file to check"
            style={({ pressed }: { pressed: boolean }) => [
              styles.choiceCard,
              styles.choiceCardWide,
              {
                backgroundColor:
                  inputMode === 'file' ? selectedBackground : unselectedBackground,
                borderColor: inputMode === 'file' ? selectedIcon : unselectedBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.choiceTitleRow}>
              <FileText
                size={26}
                strokeWidth={2.3}
                color={inputMode === 'file' ? selectedIcon : unselectedIcon}
                aria-hidden="true"
                focusable="false"
              />
              <Text
                style={[
                  styles.choiceTitle,
                  { color: inputMode === 'file' ? selectedText : unselectedText },
                ]}
              >
                Send a file
              </Text>
            </View>
            {inputMode === 'file' && (
              <View style={styles.choiceCheck}>
                <CircleCheck
                  size={22}
                  strokeWidth={2.4}
                  color={selectedIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              </View>
            )}
          </Pressable>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
            },
          ]}
        >
          {inputMode === 'text' ? (
            <>
              <Text style={[styles.fieldLabel, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
                Paste the message here
              </Text>
              <TextInput
                multiline
                numberOfLines={5}
                accessibilityLabel="Message to check"
                value={inputText}
                onChangeText={(value) => {
                  setInputText(value);
                  clearScamCheckError();
                }}
                placeholder="Paste or type the message…"
                placeholderTextColor={highContrast ? '#CBD5E1' : '#6B7780'}
                style={[
                  styles.textArea,
                  {
                    fontSize: getBodySize(),
                    lineHeight: getBodySize() * 1.4,
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                    backgroundColor: highContrast ? '#0F172A' : '#FAF8F5',
                    borderColor: highContrast ? '#FFFFFF' : '#CBD5E1',
                  },
                ]}
              />

              {!showExamples ? (
                <Pressable
                  onPress={() => setShowExamples(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Show example messages"
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.exampleLink,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text style={[styles.exampleLinkText, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
                    Try an example ›
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.examples}>
                  <Text style={[styles.examplesLabel, { color: highContrast ? '#CBD5E1' : '#475569' }]}>
                    Choose an example
                  </Text>
                  {presets.map((preset) => (
                    <Pressable
                      key={preset.label}
                      onPress={() => chooseExample(preset.text)}
                      accessibilityRole="button"
                      accessibilityLabel={`Use example: ${preset.label}`}
                      style={({ pressed }: { pressed: boolean }) => [
                        styles.exampleChip,
                        {
                          backgroundColor: highContrast ? '#0F172A' : '#F1F5F9',
                          borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.exampleChipText, { color: highContrast ? '#FFFFFF' : '#334155' }]}>
                        {preset.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ) : inputMode === 'photo' ? (
            <>
              <Text style={[styles.fieldLabel, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
                Take a photo of the message
              </Text>
              <View style={styles.fileUploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  id="scam-file-upload"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="scam-file-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: '140px',
                    padding: '18px',
                    textAlign: 'center',
                    backgroundColor: highContrast ? '#334155' : '#EFF6FF',
                    borderRadius: '16px',
                    border: `2px dashed ${highContrast ? '#FFFFFF' : '#3B82F6'}`,
                    color: highContrast ? '#FFFFFF' : '#1D4ED8',
                    fontWeight: 700,
                    fontSize: '18px',
                  }}
                >
                  <Camera size={32} strokeWidth={2.2} color={highContrast ? '#FFFFFF' : '#1D4ED8'} aria-hidden="true" focusable="false" />
                  {imagePreview ? 'Picture selected — choose another' : 'Choose a photo'}
                </label>
              </View>

              {imagePreview && (
                <View style={styles.imagePreviewContainer}>
                  <img
                    src={imagePreview}
                    alt="Selected picture to check"
                    style={{
                      maxHeight: '180px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      objectFit: 'contain',
                    }}
                  />
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.fieldLabel, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
                Send a file
              </Text>
              <View style={styles.fileUploadArea}>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.csv,.md,.json,image/png,image/jpeg,image/webp,image/gif"
                  id="scam-document-upload"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="scam-document-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: '140px',
                    padding: '18px',
                    textAlign: 'center',
                    backgroundColor: highContrast ? '#334155' : '#EFF6FF',
                    borderRadius: '16px',
                    border: `2px dashed ${highContrast ? '#FFFFFF' : '#3B82F6'}`,
                    color: highContrast ? '#FFFFFF' : '#1D4ED8',
                    fontWeight: 700,
                    fontSize: '18px',
                  }}
                >
                  <FileText size={32} strokeWidth={2.2} color={highContrast ? '#FFFFFF' : '#1D4ED8'} aria-hidden="true" focusable="false" />
                  {selectedFile ? 'Choose a different file' : 'Choose a file'}
                </label>
              </View>

              {selectedFile && (
                <View style={styles.fileSummary}>
                  <Text
                    style={[
                      styles.fileName,
                      { fontSize: getBodySize() - 2, color: highContrast ? '#FFFFFF' : '#17212B' },
                    ]}
                  >
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.fileMeta, { color: highContrast ? '#CBD5E1' : '#475569' }]}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
              )}

              {imagePreview && selectedFile?.type.startsWith('image/') && (
                <View style={styles.imagePreviewContainer}>
                  <img
                    src={imagePreview}
                    alt="Selected picture to check"
                    style={{
                      maxHeight: '180px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      objectFit: 'contain',
                    }}
                  />
                </View>
              )}

              <Text style={[styles.fileHint, { color: highContrast ? '#CBD5E1' : '#475569' }]}>
                A photo, a PDF, a Word document, or a text file works.
              </Text>
            </>
          )}
        </View>

        {(fileError || scamCheckError) && (
          <View
            role="alert"
            style={[
              styles.errorBox,
              {
                backgroundColor: highContrast ? '#78350F' : '#FEF3C7',
                borderColor: '#F59E0B',
              },
            ]}
          >
            <CircleHelp
              size={26}
              strokeWidth={2.4}
              color={highContrast ? '#FFFFFF' : '#92400E'}
              aria-hidden="true"
              focusable="false"
            />
            <Text
              style={[
                styles.errorText,
                {
                  fontSize: getBodySize() - 2,
                  lineHeight: (getBodySize() - 2) * 1.4,
                  color: highContrast ? '#FFFFFF' : '#92400E',
                },
              ]}
            >
              {fileError || scamCheckError}
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          {isAnalyzing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1E5E3A" />
              <Text style={styles.loadingText}>
                {progressStep === 0 ? 'Reading the message…' : 'Looking for warning signs…'}
              </Text>
            </View>
          ) : (
            <BigButton
              label="Check this message"
              variant="navy"
              disabled={!canCheck}
              onPress={handleCheck}
              minHeight={68}
            />
          )}

          <Text
            style={[
              styles.privacyDisclaimer,
              { color: highContrast ? '#CBD5E1' : '#475569' },
            ]}
          >
            We never store your private information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  headerSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontWeight: '600',
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  choiceCard: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 130,
    minHeight: 88,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
  },
  choiceCardWide: {
    flexBasis: '100%',
  },
  choiceCheck: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  choiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    textAlignVertical: 'top',
    marginBottom: 6,
  },
  exampleLink: {
    minHeight: 56,
    justifyContent: 'center',
  },
  exampleLinkText: {
    fontSize: 18,
    fontWeight: '800',
  },
  examples: {
    marginTop: 4,
  },
  examplesLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  exampleChip: {
    minHeight: 64,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  exampleChipText: {
    fontSize: 18,
    fontWeight: '700',
  },
  fileUploadArea: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  fileSummary: {
    marginTop: 12,
    alignItems: 'center',
  },
  fileName: {
    fontWeight: '800',
    textAlign: 'center',
  },
  fileMeta: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  fileHint: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 0,
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4EEE6',
    borderRadius: 16,
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#183E2A',
    textAlign: 'center',
  },
  privacyDisclaimer: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    marginTop: 8,
  },
});

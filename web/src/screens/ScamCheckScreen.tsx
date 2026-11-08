/**
 * Screen 6: Instant Scam Check — Input Screen
 * Reassuring entry screen where seniors can paste text, try realistic samples, or upload an image.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

export const ScamCheckScreen: React.FC = () => {
  const { runScamCheck, fontSize, highContrast } = useApp();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleCheck = async () => {
    if (!inputText.trim() && !imagePreview) return;
    setIsAnalyzing(true);
    try {
      await runScamCheck({
        text: inputText.trim(),
        imageBase64: imagePreview ? imagePreview.split(',')[1] || imagePreview : undefined,
        imageMime,
      });
      navigate(ROUTES.checkResult);
    } catch (err) {
      console.error('Check failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageMime(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample presets for senior convenience
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
            Not sure if a text, email, or bill is real? We will analyze it for you in plain language.
          </Text>
        </View>

        {/* Option A: Paste or Type */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Heading
            level={2}
            style={styles.cardSectionTitle}
            color={highContrast ? '#FFFFFF' : '#0F172A'}
          >
            Option A: Paste or type the message
          </Heading>

          <TextInput
            multiline
            numberOfLines={4}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Example: 'USPS: Your package cannot be delivered until you pay a fee...' or paste text here"
            placeholderTextColor="#94A3B8"
            style={[
              styles.textArea,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#FFFFFF' : '#0F172A',
                backgroundColor: highContrast ? '#0F172A' : '#FAF8F5',
                borderColor: highContrast ? '#FFFFFF' : '#CBD5E1',
              },
            ]}
          />

          {/* Quick preset chips */}
          <Text style={styles.presetsLabel}>Or try a common practice sample:</Text>
          <View style={styles.presetButtonsWrap}>
            {presets.map((p, idx) => (
              <Pressable
                key={idx}
                onPress={() => setInputText(p.text)}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Option B: Picture or Screenshot Upload */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Heading
            level={2}
            style={styles.cardSectionTitle}
            color={highContrast ? '#FFFFFF' : '#0F172A'}
          >
            Option B: Upload a picture or screenshot
          </Heading>

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
                display: 'block',
                textAlign: 'center',
                padding: '14px',
                backgroundColor: highContrast ? '#334155' : '#EFF6FF',
                borderRadius: '12px',
                border: '2px dashed #3B82F6',
                color: highContrast ? '#FFFFFF' : '#1D4ED8',
                fontWeight: 700,
                fontSize: '17px',
              }}
            >
              {imagePreview ? '📷 Picture Selected! (Tap to change)' : '📷 Tap to Choose Photo from Gallery'}
            </label>
          </View>

          {imagePreview && (
            <View style={styles.imagePreviewContainer}>
              <img
                src={imagePreview}
                alt="Uploaded preview"
                style={{
                  maxHeight: '160px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  objectFit: 'contain',
                }}
              />
            </View>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {isAnalyzing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Analyzing message safely with Gemini Flash...</Text>
            </View>
          ) : (
            <BigButton
              label="Check this message now"
              variant="primary"
              disabled={!inputText.trim() && !imagePreview}
              onPress={handleCheck}
              minHeight={64}
            />
          )}

          <Text
            style={[
              styles.privacyDisclaimer,
              { color: highContrast ? '#CBD5E1' : '#475569' },
            ]}
          >
            We never store your passwords, bank cards, or personal secrets.
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
    padding: 18,
    paddingBottom: 40,
  },
  headerSection: {
    marginVertical: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    lineHeight: 26,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    textAlignVertical: 'top',
    lineHeight: 24,
    marginBottom: 14,
  },
  presetsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  presetButtonsWrap: {
    flexDirection: 'column',
    gap: 8,
  },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  fileUploadArea: {
    marginVertical: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  actionContainer: {
    marginTop: 10,
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
  },
  privacyDisclaimer: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 12,
  },
});

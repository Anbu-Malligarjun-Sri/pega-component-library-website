import { useEffect, useRef, useState } from 'react';
import { Text, withConfiguration } from '@pega/cosmos-react-core';
import { getMappedKey } from '../shared/utils';
import {
  ProfileCardBody,
  ProfileCardFallback,
  ProfileCardHandle,
  ProfileCardIdentity,
  ProfileCardImage,
  ProfileCardImageCaption,
  ProfileCardImageFrame,
  ProfileCardShell,
  ProfileCardStatus,
} from './styles';
import '../shared/create-nonce';

export type ProfileCardProps = {
  name: string;
  title?: string;
  handle?: string;
  status?: string;
  imageProperty?: string;
  imageAttachmentProperty?: string;
  imageUrl?: string;
  imageAttachmentCategory?: string;
  imageAttachmentName?: string;
  showUserInfo?: boolean;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  className?: string;
  getPConnect: () => typeof PConnect;
};

const isDirectImageSource = (value: string) =>
  /^(data:image\/|blob:|https?:\/\/|\/)/i.test(value) ||
  /^(?:\/9j\/|iVBORw0KGgo|R0lGOD|PHN2Zy)/.test(value);

const getPropertyReference = (value: string) => {
  const trimmedValue = value.trim();
  if (trimmedValue.startsWith('@P ')) return trimmedValue.slice(3).trim();
  return trimmedValue.startsWith('.') ? trimmedValue : '';
};

const resolveConfiguredValue = (value: string, pConnect: typeof PConnect) => {
  const propertyReference = getPropertyReference(value);
  if (!propertyReference) return value.trim();
  return String(pConnect.getValue(propertyReference) ?? '').trim();
};

const getImageSource = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const imageObject = value as Record<string, unknown>;
  const candidateKeys = ['url', 'src', 'imageUrl', 'imageURL', 'value', 'content', 'data', 'ID', 'id'];
  for (const key of candidateKeys) {
    const candidate = getImageSource(imageObject[key]);
    if (candidate) return candidate;
  }

  return '';
};

const getAttachmentId = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const attachment = value as Record<string, unknown>;
  return String(
    attachment.ID ||
      attachment.id ||
      attachment.pyGUID ||
      attachment.pzInsKey ||
      attachment.pzInsKey ||
      attachment.key ||
      attachment.pyID ||
      attachment.pzFileName ||
      '',
  ).trim();
};

const getAttachmentValues = (value: unknown): Array<Record<string, unknown>> => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === 'object') as Array<Record<string, unknown>>;
  }
  if (typeof value === 'object') {
    return [value as Record<string, unknown>];
  }
  return [];
};

const selectAttachmentCandidate = (
  value: unknown,
  imageAttachmentCategory = '',
  imageAttachmentName = '',
): Record<string, unknown> | undefined => {
  const records = getAttachmentValues(value);
  const desiredCategory = imageAttachmentCategory.trim().toLowerCase();
  const desiredName = imageAttachmentName.trim().toLowerCase();

  const matches = records.filter((record) => {
    const category = String(record.pyCategory || record.category || record.pyFileCategory || '').toLowerCase();
    const name = String(record.fileName || record.name || record.pyFileName || record.pzFileName || '').toLowerCase();
    const mimeType = String(record.mimeType || record.pyMimeType || '').toLowerCase();
    const categoryMatches =
      !desiredCategory ||
      category === desiredCategory ||
      (desiredCategory === 'image' && mimeType.startsWith('image/'));
    const nameMatches = !desiredName || name === desiredName || name.includes(desiredName);
    return categoryMatches && nameMatches;
  });

  return matches.length > 0
    ? matches.sort((left, right) => {
        const leftTime = String(left.pxCreateDateTime || left.createTime || '').toLowerCase();
        const rightTime = String(right.pxCreateDateTime || right.createTime || '').toLowerCase();
        return rightTime.localeCompare(leftTime);
      })[0]
    : records[0];
};

const decodeAttachmentContent = (content: any, mimeType: string) => {
  if (content?.data instanceof Blob) return content.data;
  if (content?.data instanceof ArrayBuffer) return new Blob([content.data], { type: mimeType });

  const data = String(content?.data || '');
  const encoding = content?.headers?.['content-transfer-encoding'];
  if (encoding === 'base64') {
    const binary = window.atob(data);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new Blob([bytes], { type: mimeType });
  }

  return new Blob([data], { type: mimeType });
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

export const PegaExtensionsProfileCard = (props: ProfileCardProps) => {
  const {
    name = '',
    title = '',
    handle = '',
    status = '',
    imageProperty = '',
    imageAttachmentProperty = '',
    imageUrl = '',
    imageAttachmentCategory = 'Image',
    imageAttachmentName = '',
    showUserInfo = true,
    enableTilt = true,
    enableMobileTilt = false,
    className = '',
    getPConnect,
  } = props;
  const shellRef = useRef<HTMLElement>(null);
  const pConnect = getPConnect();
  const [profileValues, setProfileValues] = useState(() => ({
    name: resolveConfiguredValue(name, pConnect),
    title: resolveConfiguredValue(title, pConnect),
    handle: resolveConfiguredValue(handle, pConnect),
    status: resolveConfiguredValue(status, pConnect),
  }));
  const [resolvedImageUrl, setResolvedImageUrl] = useState(imageUrl);

  useEffect(() => {
    const currentPConnect = getPConnect();
    const nextValues = {
      name: resolveConfiguredValue(name, currentPConnect),
      title: resolveConfiguredValue(title, currentPConnect),
      handle: resolveConfiguredValue(handle, currentPConnect),
      status: resolveConfiguredValue(status, currentPConnect),
    };

    setProfileValues(previous => ({
      name: nextValues.name || previous.name,
      title: nextValues.title || previous.title,
      handle: nextValues.handle || previous.handle,
      status: nextValues.status || previous.status,
    }));
  }, [handle, name, status, title]);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;
    const currentPConnect = getPConnect();
    const imagePropertyReference = getPropertyReference(imageProperty);
    const attachmentPropertyReference = getPropertyReference(imageAttachmentProperty);
    const mappedProperty = imagePropertyReference ? '' : imageProperty.trim() ? getMappedKey(imageProperty.trim()) : '';
    const mappedAttachmentProperty = attachmentPropertyReference
      ? ''
      : imageAttachmentProperty.trim()
        ? getMappedKey(imageAttachmentProperty.trim())
        : '';

    const propertyValue = imagePropertyReference
      ? currentPConnect.getValue(imagePropertyReference)
      : mappedProperty
        ? currentPConnect.getValue(mappedProperty)
        : '';

    const attachmentPropertyValue = attachmentPropertyReference
      ? currentPConnect.getValue(attachmentPropertyReference)
      : mappedAttachmentProperty
        ? currentPConnect.getValue(mappedAttachmentProperty)
        : '';

    const attachmentCandidate = selectAttachmentCandidate(
      attachmentPropertyValue || propertyValue,
      imageAttachmentCategory,
      imageAttachmentName,
    );
    const imageValue = getImageSource(imageUrl || propertyValue || attachmentPropertyValue);
    const attachmentId = getAttachmentId(attachmentCandidate || propertyValue || attachmentPropertyValue);

    const loadAttachmentImage = async (attachment: any) => {
      const attachmentUtils = PCore?.getAttachmentUtils?.();
      if (!attachmentUtils?.downloadAttachment || !attachment?.ID) return;

      try {
        const content: any = await attachmentUtils.downloadAttachment(
          attachment.ID,
          currentPConnect.getContextName(),
          attachment.responseType,
        );
        if (cancelled) return;
        const responseHeaders = content?.headers || {};
        const mimeType = attachment.mimeType || responseHeaders['content-type'] || 'image/*';
        objectUrl = URL.createObjectURL(decodeAttachmentContent(content, mimeType));
        setResolvedImageUrl(objectUrl);
      } catch {
        if (!cancelled) setResolvedImageUrl('');
      }
    };

    const loadCaseAttachment = async () => {
      const caseId = currentPConnect.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);
      const attachmentUtils = PCore?.getAttachmentUtils?.();
      if (!caseId || !attachmentUtils?.getCaseAttachments) return;

      try {
        const attachments = await attachmentUtils.getCaseAttachments(caseId, currentPConnect.getContextName());
        const category = imageAttachmentCategory.trim().toLowerCase();
        const desiredName = imageAttachmentName.trim().toLowerCase();
        const listOfAttachments = Array.isArray(attachments) ? attachments : [];
        const imageAttachment = listOfAttachments
          .filter((attachment: any) => {
            const attachmentCategory = String(attachment.category || attachment.pyCategory || '').toLowerCase();
            const attachmentName = String(attachment.name || attachment.fileName || attachment.pyFileName || '').toLowerCase();
            const mimeType = String(attachment.mimeType || attachment.pyMimeType || '').toLowerCase();
            const categoryMatches =
              !category ||
              attachmentCategory === category ||
              (category === 'image' && mimeType.startsWith('image/'));
            const nameMatches = !desiredName || attachmentName === desiredName || attachmentName.includes(desiredName);
            return categoryMatches && nameMatches;
          })
          .sort((left: any, right: any) =>
            String(right.createTime || right.pxCreateDateTime || '').localeCompare(
              String(left.createTime || left.pxCreateDateTime || ''),
            ),
          )[0];

        if (imageAttachment) await loadAttachmentImage(imageAttachment);
      } catch {
        if (!cancelled) setResolvedImageUrl('');
      }
    };

    if (!imageUrl && attachmentId && !isDirectImageSource(imageValue)) {
      void loadAttachmentImage({ ...((attachmentCandidate || propertyValue || attachmentPropertyValue) as Record<string, unknown>), ID: attachmentId });
    } else if (!imageUrl && !imageValue && !attachmentId) {
      void loadCaseAttachment();
    }

    if (imageValue && isDirectImageSource(imageValue)) {
      setResolvedImageUrl(
        imageValue.startsWith('data:image/') || imageValue.startsWith('blob:') || imageValue.startsWith('/') || imageValue.startsWith('http')
          ? imageValue
          : `data:image/*;base64,${imageValue}`,
      );
      return () => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }
    if (!imageValue && !attachmentId) return undefined;

    const assetLoader = PCore?.getAssetLoader?.();
    if (!assetLoader?.getSvcImage) return undefined;

    assetLoader
      .getSvcImage(imageValue || attachmentId)
      .then((blob: Blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setResolvedImageUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setResolvedImageUrl('');
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [
    getPConnect,
    imageAttachmentCategory,
    imageAttachmentName,
    imageAttachmentProperty,
    imageProperty,
    imageUrl,
  ]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || !enableTilt) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = shell.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      shell.style.setProperty('--profile-card-pointer-x', `${x}%`);
      shell.style.setProperty('--profile-card-pointer-y', `${y}%`);
      shell.style.setProperty('--profile-card-rotate-x', `${((x - 50) / 18).toFixed(2)}deg`);
      shell.style.setProperty('--profile-card-rotate-y', `${((50 - y) / 22).toFixed(2)}deg`);
    };
    const resetTilt = () => {
      shell.style.setProperty('--profile-card-rotate-x', '0deg');
      shell.style.setProperty('--profile-card-rotate-y', '0deg');
    };

    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', resetTilt);
    return () => {
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', resetTilt);
    };
  }, [enableTilt]);

  return (
    <ProfileCardShell
      ref={shellRef}
      className={className}
      enableTilt={enableTilt || enableMobileTilt}
      aria-label={`${profileValues.name}${profileValues.title ? `, ${profileValues.title}` : ''}`}
    >
      <ProfileCardImageFrame>
        {resolvedImageUrl ? (
          <ProfileCardImage
            src={resolvedImageUrl}
            alt={`${profileValues.name || 'Profile'} profile`}
            onError={() => setResolvedImageUrl('')}
          />
        ) : (
          <ProfileCardFallback aria-hidden='true'>{getInitials(name)}</ProfileCardFallback>
        )}
        <ProfileCardImageCaption>
          <Text variant='h2' style={{ color: 'inherit' }}>
            {profileValues.name}
          </Text>
          {profileValues.title && <ProfileCardHandle>{profileValues.title}</ProfileCardHandle>}
        </ProfileCardImageCaption>
      </ProfileCardImageFrame>
      {showUserInfo && (
        <ProfileCardBody>
          <ProfileCardIdentity>
            {profileValues.handle ? <ProfileCardHandle>@{profileValues.handle}</ProfileCardHandle> : <span />}
            {profileValues.status && <ProfileCardStatus>{profileValues.status}</ProfileCardStatus>}
          </ProfileCardIdentity>
        </ProfileCardBody>
      )}
    </ProfileCardShell>
  );
};

export default withConfiguration(PegaExtensionsProfileCard);

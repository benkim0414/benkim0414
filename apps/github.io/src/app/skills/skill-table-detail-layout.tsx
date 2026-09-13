import { BottomSheet } from '@astryxdesign/core/BottomSheet';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { Text } from '@astryxdesign/core/Text';
import { isImeKeyEvent, useMediaQuery } from '@astryxdesign/core/hooks';
import { useEffect, useRef, type ReactElement, type RefObject } from 'react';

import { SkillDetailContent } from './skill-detail-content';
import type { ResolvedSkillDetail } from './skill-detail.types';
import type { SkillCategory } from './skill-list.types';
import {
  SkillTable,
  type SkillRowActivation,
  type SkillTableProps,
} from './skill-table';

export const TABLE_QUERY = '(min-width: 768px)';
export const COMPACT_SURFACE_QUERY =
  '(max-width: 768px), (max-width: 1024px) and (pointer: coarse) and (hover: none)';

export interface SkillTableDetailLayoutProps extends Pick<
  SkillTableProps,
  | 'skills'
  | 'query'
  | 'selectedCategories'
  | 'activeSkillId'
  | 'onQueryChange'
  | 'onSelectedCategoriesChange'
> {
  readonly activeDetail: ResolvedSkillDetail | null;
  readonly finalFocusRef?: RefObject<HTMLElement | null>;
  readonly onSkillActivate: (activation: SkillRowActivation) => void;
  readonly onClose: (restoreFocus: boolean) => void;
}

interface SkillDetailBodyProps {
  readonly detail: ResolvedSkillDetail;
  readonly onClose: () => void;
}

function SkillDetailBody({
  detail,
  onClose,
}: SkillDetailBodyProps): ReactElement {
  return (
    <VStack gap={6} padding={4}>
      <HStack hAlign="end">
        <IconButton
          icon={<Icon icon="close" size="sm" />}
          label={`Close ${detail.skill.name} details`}
          tooltip={`Close ${detail.skill.name} details`}
          variant="ghost"
          onClick={onClose}
        />
      </HStack>
      <VStack gap={2} hAlign="start">
        <Heading level={2}>{detail.skill.name}</Heading>
        <Text as="p" color="secondary" type="body">
          {detail.skill.description}
        </Text>
      </VStack>
      <SkillDetailContent detail={detail} />
    </VStack>
  );
}

export function SkillTableDetailLayout({
  skills,
  query,
  selectedCategories,
  activeSkillId,
  activeDetail,
  finalFocusRef,
  onQueryChange,
  onSelectedCategoriesChange,
  onSkillActivate,
  onClose,
}: SkillTableDetailLayoutProps): ReactElement {
  const isCompactSurface = useMediaQuery(COMPACT_SURFACE_QUERY);
  const retainedCompactDetailRef = useRef<ResolvedSkillDetail | null>(null);
  const detailWidth = useResizable({
    defaultSize: 380,
    minSizePx: 320,
    maxSizePx: 560,
  });

  if (isCompactSurface && activeDetail != null) {
    retainedCompactDetailRef.current = activeDetail;
  }

  useEffect(() => {
    if (activeDetail == null || isCompactSurface) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !isImeKeyEvent(event)
      ) {
        onClose(true);
        finalFocusRef?.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDetail, finalFocusRef, isCompactSurface, onClose]);

  const detailPanel =
    activeDetail == null ? undefined : (
      <>
        <ResizeHandle
          isAlwaysVisible={false}
          isReversed
          label="Resize skill details"
          resizable={detailWidth.props}
        />
        <LayoutPanel
          hasDivider
          isScrollable
          label={`${activeDetail.skill.name} details`}
          padding={0}
          resizable={detailWidth.props}
          role="region"
        >
          <SkillDetailBody
            detail={activeDetail}
            onClose={() => {
              onClose(true);
              finalFocusRef?.current?.focus();
            }}
          />
        </LayoutPanel>
      </>
    );

  return (
    <>
      <Layout
        end={isCompactSurface ? undefined : detailPanel}
        height="fill"
        padding={0}
      >
        <LayoutContent isScrollable padding={0}>
          <SkillTable
            activeSkillId={activeSkillId}
            query={query}
            selectedCategories={selectedCategories}
            skills={skills}
            onQueryChange={onQueryChange}
            onSelectedCategoriesChange={onSelectedCategoriesChange}
            onSkillActivate={onSkillActivate}
          />
        </LayoutContent>
      </Layout>
      <BottomSheet
        finalFocusRef={finalFocusRef}
        height="tall"
        isOpen={isCompactSurface && activeDetail != null}
        label={
          retainedCompactDetailRef.current == null
            ? 'Skill details'
            : `${retainedCompactDetailRef.current.skill.name} details`
        }
        onOpenChange={(open) => !open && onClose(true)}
      >
        {isCompactSurface && retainedCompactDetailRef.current != null ? (
          <SkillDetailBody
            detail={retainedCompactDetailRef.current}
            onClose={() => onClose(true)}
          />
        ) : null}
      </BottomSheet>
    </>
  );
}

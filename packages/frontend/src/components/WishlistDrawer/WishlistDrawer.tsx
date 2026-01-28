'use client';

import type { WishlistItem } from '../../context/TripContext';
import type { AlgoliaCity } from '@vibe-travel/shared';
import styles from './WishlistDrawer.module.css';

interface WishlistDrawerProps {
  items: WishlistItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (cityId: string) => void;
  onMoveToTrip: (city: AlgoliaCity) => void;
}

export function WishlistDrawer({
  items,
  isOpen,
  onClose,
  onRemove,
  onMoveToTrip,
}: WishlistDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        data-testid="wishlist-drawer"
        role="dialog"
        aria-label="Wishlist"
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>💫 My Wishlist</h3>
            <span className={styles.count}>
              {items.length} destination{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close wishlist"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🌍</span>
              <p className={styles.emptyText}>No destinations saved yet</p>
              <p className={styles.emptySubtext}>
                Ask the assistant to add cities to your wishlist
              </p>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.city.objectID} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.city.image_url ? (
                      <img
                        src={item.city.image_url}
                        alt={item.city.city}
                        className={styles.cityImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>🏙️</div>
                    )}
                  </div>
                  <div className={styles.itemContent}>
                    <h4 className={styles.cityName}>{item.city.city}</h4>
                    <p className={styles.countryName}>{item.city.country}</p>
                    {item.notes && (
                      <p className={styles.notes}>{item.notes}</p>
                    )}
                    <div className={styles.tags}>
                      {item.city.vibe_tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => onMoveToTrip(item.city)}
                      className={styles.actionButton}
                      aria-label="Add to trip"
                    >
                      ✈️ Add to Trip
                    </button>
                    <button
                      onClick={() => onRemove(item.city.objectID)}
                      className={styles.removeButton}
                      aria-label="Remove from wishlist"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

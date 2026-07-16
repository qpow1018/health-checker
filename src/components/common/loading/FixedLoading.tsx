import styles from "./fixedLoading.module.scss";

export default function FixedLoading() {
  return (
    <div className={styles['fixed-loading']}>
      <div className={styles['spinner']} />
    </div>
  );
}

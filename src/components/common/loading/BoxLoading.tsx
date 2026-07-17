import styles from "./boxLoading.module.scss";

type TBoxLoadingProps = {
  height?: number | string;
};

export default function BoxLoading(props: TBoxLoadingProps) {
  const { height = 360 } = props;

  return (
    <div className={styles['box-loading']} style={{ height }}>
      <div className={styles['spinner']} />
    </div>
  );
}
